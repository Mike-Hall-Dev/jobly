const { sqlForPartialUpdate } = require("./sql")
const BadRequestError = require("../expressError")

describe("sqlForPartialUpdate", function () {
    test("working exmaple", function () {
        const result = sqlForPartialUpdate(
            { userName: "New Username", emailAddress: "New@email.com" },
            { userName: "username", emailAddress: "email" });
        expect(result).toEqual({
            setCols: '"username"=$1, "email"=$2',
            values: ['New Username', 'New@email.com']
        })
    });

    test("Non-working Example", function () {
        try {
            const result = sqlForPartialUpdate(
                {},
                { userName: "username", emailAddress: "email" })
        }
        catch{
            expect(BadRequestError).toBeTruthy();
        }
    })
})