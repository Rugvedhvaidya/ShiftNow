//This function is used to cath all the async functions in the routes.
module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}