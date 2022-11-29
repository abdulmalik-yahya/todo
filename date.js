// jshint esversion:6
// module.exports.getDate = getDate; // here we are just exporting, not calling as in getDate();
const today = new Date();
exports.getDate = function () { // became anonymous function by assigning to a variable : same as function getDate(){...}

    // const today = new Date();
    const options = { weekday: "long", day: "numeric", month: "long" }; // we can also use year,hour, etc, refer docs
    return today.toLocaleDateString("en-IN", options);

}

// module.exports.getDay = getDay;
exports.getDay = function () {


    const options = { weekday: "long" };
    return today.toLocaleDateString("en-IN", options);

}