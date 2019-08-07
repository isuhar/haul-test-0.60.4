
function filterEmpty(value) {
    return value.filter(Boolean)
}


function spliceFilter(value, condition) {
    const findIndex = value.findIndex(condition)

    if (findIndex !== -1) {
        value.splice(findIndex, 1)
        spliceFilter(value, condition)
    }
}

module.exports = {
    filterEmpty,
    spliceFilter
}
