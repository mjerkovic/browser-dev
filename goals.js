var GoalState = {
    Inactive: "Inactive",
    Active: "Active",
    Completed: "Completed",
    Failed: "Failed"
};

var Goal = Class.extend({

    init: function() {
        this.goalState = GoalState.Inactive;
    },

    activate: function(entity) {
        this.goalState = GoalState.Active;
    },

    process: function(entity) {
        this.activateIfInactive(entity);
    },

    terminate: function(entity) {
    },

    isCompleted: function() {
        return this.goalState == GoalState.Completed;
    },

    hasFailed: function() {
        return this.goalState == GoalState.Failed;
    },

    activateIfInactive: function(entity) {
        if (this.goalState == GoalState.Inactive) {
            this.activate(entity);
        }
    }

});

var ComplexGoal = Goal.extend({

    init: function() {
        this._super();
        this.subGoals = [];
    },

    process: function(entity) {
        this._super(entity);
        return this.processSubGoals(entity);
    },

    processSubGoals: function(entity) {
        while(!this.subGoals.isEmpty() &&
            (this.subGoals.peek().isCompleted() ||
                this.subGoals.peek().hasFailed())) {
            var subGoal = this.subGoals.shift();
            subGoal.terminate(entity);
        }
        if (!this.subGoals.isEmpty()) {
            var subGoalStatus = this.subGoals.peek().process(entity);
            if (subGoalStatus == GoalState.Completed && this.subGoals.length > 1) {
                return GoalState.Active;
            }
            return subGoalStatus;
        } else {
            this.goalState = GoalState.Completed;
            return this.goalState;
        }
    },

    addSubGoalToFront: function(goal) {
        this.subGoals.unshift(goal);
    },

    addSubGoalToBack: function(goal) {
        this.subGoals.push(goal);
    }

});

var TankerThinkGoal = ComplexGoal.extend({
    init: function(spec) {
        this._super();
        this.mine = spec.mine;
        this.hq = spec.hq;
    },

    activate: function(entity) {
        this._super(entity);
        this.addSubGoalToFront(new RequestMineEntryGoal({mine: this.mine}));
        this.addSubGoalToBack(new FollowPathGoal());
        this.addSubGoalToBack(new LoadingGoal({mine: this.mine}));
        this.addSubGoalToBack(new LeaveMineGoal());
        this.addSubGoalToBack(new ArriveAtGoal({x: this.hq.position.X(), y: this.hq.position.Y()}));
    },

    process: function(entity) {
        var subGoalStatus = this._super(entity);
        if(subGoalStatus == GoalState.Completed) {
            var subGoal = this.subGoals.shift();
            subGoal.goalState = GoalState.Inactive;
            this.addSubGoalToBack(subGoal);
        }
        return this.goalState;
    }

});

var RequestMineEntryGoal = Goal.extend({

    init: function(spec) {
        this._super();
        this.mine = spec.mine;
    },

    process: function(entity) {
        this._super(entity);
        console.log("Requesting mine entry");
        var bay = this.mine.requestBay();
        if (bay) {
            entity.assignBay(bay);
            this.goalState = GoalState.Completed;
        }
        return this.goalState;
    }

});

var FollowPathGoal = ComplexGoal.extend({

    init: function() {
        this._super();
        this.path = [];
    },

    activate: function(entity) {
        this._super(entity);
        this.path = this.path.concat(entity.loadingBay.approach.inbound);
        this.reactivate();
    },

    reactivate: function() {
        if (this.subGoals.isEmpty() || this.subGoals.peek().isCompleted()) {
            var destination = this.path.shift();
            if (this.path.length > 0) {
                this.addSubGoalToBack(new SeekToGoal(destination));
            } else {
                this.addSubGoalToBack(new ArriveAtGoal(destination));
            }
        }
    },

    process: function(entity) {
        var subGoalStatus = this._super(entity);
        if (subGoalStatus == GoalState.Completed && !this.path.isEmpty()) {
            this.reactivate();
            return this.goalState;
        }
        this.goalState = subGoalStatus;
        return subGoalStatus;
    }
});

var ArriveAtGoal = Goal.extend({

    init: function(dest) {
        this._super();
        this.destination = dest;
        console.log("Arriving at " + this.destination.x + ", " + this.destination.y);
    },

    activate: function(entity) {
        this._super(entity);
        entity.arriveAt(this.destination);
    },

    process: function(entity) {
        this._super(entity);
      if (entity.position.distanceFrom($V([this.destination.x, this.destination.y])) <= 0.2) {
        this.goalState = GoalState.Completed;
      }
      return this.goalState;
    },

    terminate: function(entity) {
        entity.arriveOff();
    }

});

var SeekToGoal = Goal.extend({

    init: function(dest) {
        this._super();
        this.destination = dest;
        console.log("Seeking to " + this.destination.x + ", " + this.destination.y);
    },

    activate: function(entity) {
        this._super(entity);
        entity.seekTo(this.destination);
    },

    process: function(entity) {
        this._super(entity);
        if (entity.intersectsPoint($V([this.destination.x, this.destination.y]))) {
            this.goalState = GoalState.Completed;
        }
        return this.goalState;
    },

    terminate: function(entity) {
        entity.seekOff();
    }

});

var LeaveMineGoal = Goal.extend({

    init: function() {
        this._super();
        this.destination;
    },

    activate: function(entity) {
        this._super(entity);
        this.destination = entity.loadingBay.approach.outbound;
        entity.seekTo(this.destination);
        console.log("Leaving mine");
    },

    process: function(entity) {
        this._super(entity);
        if (entity.intersectsPoint($V([this.destination.x, this.destination.y]))) {
            this.goalState = GoalState.Completed;
        }
        return this.goalState;
    },

    terminate: function(entity) {
        entity.seekOff();
        entity.loadingBay.reserved = false;
        entity.loadingBay = null;
    }

});

var LoadingGoal = Goal.extend({

    init: function(spec) {
        this._super();
        this.mine = spec.mine;
    },

    activate: function(entity) {
        this._super(entity);
        entity.loading = true;
        console.log("Loading");
    },

    process: function(entity) {
        this._super(entity);
        var energy = this.mine.mineForEnergy();
        entity.loadEnergy(energy);
        if (energy == 0 || entity.capacityUsed() >= 1) {
            this.goalState = GoalState.Completed;
            return this.goalState;
        }
    },

    terminate: function(entity) {
        entity.loading = false;
    }

});