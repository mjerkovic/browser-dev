function Wall(from, to) {

    var normal = to.subtract(from).toUnitVector().perp();

    this.getFrom = function() {
        return from.dup;
    }

    this.getTo = function() {
        return to.dup();
    }

    this.getNormal = function() {
        return normal.dup();
    }

}