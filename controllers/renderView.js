/**
 * Created by robin on 2/25/17.
 */

module.exports = {
    renderViews: (res, view, options) => {
        let {op} = options
        console.log(res)
        console.log(view)
        if (op) {
            res.render(view, {
                user: op,
                title: 'Matcha'
            })
        }
        res.render(view)
    },
}