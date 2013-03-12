var GoalState = {
    Inactive: "Inactive",
    Active: "Active",
    Completed: "Completed",
    Failed: "Failed",
    Terminated: "Terminated"
};

var Goal = Class.extend({

    init: function() {
        this.goalState = GoalState.Inactive;
    },

    activate: function(entity) {
        this.goalState = GoalState.Active;
        return this.goalState;
    },

    process: function(entity) {
        this.activateIfInactive(entity);
    },

    terminate: function(entity) {
        this.goalState = GoalState.Terminated;
        return this.goalState;
    },

    isCompleted: function() {
        return this.goalState == GoalState.Completed;
    },

    isTerminated: function() {
        return this.goalState == GoalState.Terminated;
    },

    activateIfInactive: function(entity) {
        if (this.goalState = GoalState.Inactive) {
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
                this.subGoals.peek().isTerminated())) {
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

    addSubGoal: function(goal) {
        this.subGoals.unshift(goal);
    }
});

var TankerThinkGoal = ComplexGoal.extend({
    init: function(spec) {
        this._super();
        this.mine = spec.mine;
    },

    activate: function(entity) {
        this._super(entity);
        if (this.subGoals.isEmpty()) {
            if (entity.load == 0 && entity.loadingBay == null) {
                this.addSubGoal(new RequestMineEntryGoal({mine: this.mine}));
            } else if (entity.load == 0 && entity.loadingBay != null &&
                !this.mine.intersects(entity)) {
                this.addSubGoal(new FollowPathGoal(entity.loadingBay.approach));
            }
        }
        return this.goalState;
    },

    process: function(entity) {
        var subGoalStatus = this._super(entity);
        if(subGoalStatus == GoalState.Completed) {
            this.activate(entity);
            return this.goalState;
        }
        return subGoalStatus;
    }

});

var RequestMineEntryGoal = Goal.extend({

    init: function(spec) {
        this._super();
        this.mine = spec.mine;
    },

/*
    activate: function(entity) {
        this._super(entity);
    },
*/

    process: function(entity) {
        this._super(entity);
        console.log("Requesting mine entry");
        var bay = this.mine.requestBay();
        if (bay) {
            entity.assignBay(bay);
            this.goalState = GoalState.Completed;
        }
        return this.goalState;
    },

    terminate: function(entity) {
        entity.arriveOff();
        this.goalState = GoalState.Terminated;
    }

});

var FollowPathGoal = ComplexGoal.extend({

    init: function(desiredPath) {
        this._super();
        this.path = [].concat(desiredPath);
    },

    activate: function(entity) {
        this._super(entity);
        if (this.subGoals.isEmpty()) {
            var destination = this.path.shift();
            if (this.path.length > 0) {
                this.addSubGoal(new SeekToGoal(destination));
            } else {
                this.addSubGoal(new ArriveAtGoal(destination));
            }
        }
    },

    process: function(entity) {
        var subGoalStatus = this._super(entity);
        if (subGoalStatus == GoalState.Completed && !this.path.isEmpty()) {
            return this.activate(entity);
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
      if (entity.intersectsPoint($V([this.destination.x, this.destination.y]))) {
        this.goalState = GoalState.Completed;
      }
      return this.goalState;
    },

    terminate: function(entity) {
        entity.arriveOff();
        entity.velocity = Vector.Zero(2);
        this.goalState = GoalState.Terminated;
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
        this.goalState = GoalState.Terminated;
    }

});