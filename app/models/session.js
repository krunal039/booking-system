// create namespace for this project
var mnsbs = mnsbs|| {};
mnsbs.models = mnsbs.models || {};

// session entity
mnsbs.models.Session= function () {
    this.Id = undefined;
    this.SessionTitle = undefined;
    this.SessionDescription = undefined;
    this.SessionLocation = undefined;
    this.SessionStartDate = undefined;
    this.SessionEndDate = undefined;
    this.SessionSeats = undefined;
    this.__metadata = {
        type: 'SP.Data.SessionsListItem'
    };
};