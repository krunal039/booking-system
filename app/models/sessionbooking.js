// create namespace for this project
var mnsbs = mnsbs|| {};
mnsbs.models = mnsbs.models || {};

// session entity
mnsbs.models.SessionBooking= function () {
    this.Id = undefined;
    this.SessionId = undefined;
    this.EmployeeLocation = undefined;
    this.EmployeeBusinessArea = undefined;
    this.SessionBookingStatus = undefined;
    this.__metadata = {
        type: 'SP.Data.SessionBookingListItem'
    };
};