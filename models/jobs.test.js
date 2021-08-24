"use strict";

const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
} = require("../expressError");
const db = require("../db.js");
const Job = require("./jobs.js");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    testJobIds
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);



/******************* Find All */

describe("Find All Tests", function () {
    test("Find without filters", async function () {
        let jobs = await Job.findAll();
        expect(jobs).toEqual([
            {
                id: testJobIds[0],
                title: 'Test1',
                salary: 50000,
                equity: '0.5',
                companyHandle: 'c1',
                companyName: 'C1'
            },
            {
                id: testJobIds[1],
                title: 'Test2',
                salary: 20000,
                equity: '0',
                companyHandle: 'c1',
                companyName: 'C1'
            },
            {
                id: testJobIds[2],
                title: 'Test3',
                salary: 200,
                equity: '0.9',
                companyHandle: 'c1',
                companyName: 'C1'
            },
            {
                id: testJobIds[3],
                title: 'Test4',
                salary: null,
                equity: null,
                companyHandle: 'c1',
                companyName: 'C1'
            }
        ]);
    });

    test("Find jobs using optional filter", async function () {
        let jobs = await Job.findAll({ minSalary: 50000 });
        expect(jobs).toEqual([
            {
                id: testJobIds[0],
                title: 'Test1',
                salary: 50000,
                equity: '0.5',
                companyHandle: 'c1',
                companyName: 'C1'
            }]);
    });

    /********************************* get */

    describe("Testing get by ID", function () {
        test("Called with valid ID", async function () {
            let job = await Job.get(testJobIds[0]);
            expect(job).toEqual({
                id: testJobIds[0],
                title: 'Test1',
                salary: 50000,
                equity: '0.5',
                company: {
                    handle: 'c1',
                    name: 'C1',
                    description: 'Desc1',
                    numEmployees: 1,
                    logoURL: 'http://c1.img'
                }
            });
        });

        test("Testing with invalid ID", async function () {
            try {
                let job = await Job.get(-100);
                fail();
            } catch (err) {
                expect(err instanceof NotFoundError).toBeTruthy();
            }
        })
    });


})