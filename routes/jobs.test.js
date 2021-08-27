"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    testJobIds,
    u1Token,
    adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


/**========================================== POST /jobs */

describe("POST reqs to /jobs", function () {
    test("Working example", async function () {
        const response = await request(app).post('/jobs').send({
            title: "Test Post",
            salary: 100,
            equity: "0.5",
            companyHandle: "c2"
        }).set("authorization", `Bearer ${adminToken}`);
        expect(response.statusCode).toEqual(201);
        expect(response.body).toEqual({
            job: {
                id: expect.any(Number),
                title: "Test Post",
                salary: 100,
                equity: "0.5",
                companyHandle: "c2",
            },
        });
    });

    test("Non Working Example", async function () {
        const response = await request(app).post('/jobs').send({
            title: 100,
            salary: 100,
            equity: "0.5",
            companyHandle: "c2"
        }).set("authorization", `Bearer ${adminToken}`);
        expect(response.statusCode).toEqual(400);
    })

    test("Non admin request", async function () {
        const response = await request(app).post('/jobs').send({
            title: "Test Post",
            salary: 100,
            equity: "0.5",
            companyHandle: "c2"
        });
        expect(response.statusCode).toEqual(401);
    });
});

/**================================================= GET /jobs */

describe("GET requests to /jobs", function () {
    test("Gets all jobs", async function () {
        const response = await request(app).get('/jobs');
        expect(response.body).toEqual({
            "jobs": [
                {
                    "id": testJobIds[0],
                    "title": "test1",
                    "salary": 10000,
                    "equity": "0.5",
                    "companyHandle": "c1",
                    "companyName": "C1"
                },
                {
                    "id": testJobIds[1],
                    "title": "test3",
                    "salary": 40000,
                    "equity": null,
                    "companyHandle": "c1",
                    "companyName": "C1"
                },
                {
                    "id": testJobIds[2],
                    "title": "test4",
                    "salary": null,
                    "equity": "0.8",
                    "companyHandle": "c1",
                    "companyName": "C1"
                },
            ],
        })
    });

    test("Gets jobs w/ option filter applied", async function () {
        const response = await request(app).get('/jobs').query({ minSalary: 40000 });
        expect(response.body).toEqual({
            "jobs": [
                {
                    "id": testJobIds[1],
                    "title": "test3",
                    "salary": 40000,
                    "equity": null,
                    "companyHandle": "c1",
                    "companyName": "C1"
                },
            ],
        });
    });

    test("Invalid filter example", async function () {
        const response = await request(app).get('/jobs').query({ minSalary: "broken" });
        expect(response.statusCode).toEqual(400);
    })
});

/**========================================================= GET /jobs/:id */
describe('GET /jobs/id', function () {
    test("Working example", async function () {
        const response = await request(app).get(`/jobs/${testJobIds[1]}`);
        expect(response.body).toEqual({
            "job": {
                "id": testJobIds[1],
                "title": "test3",
                "salary": 40000,
                "equity": null,
                "company": {
                    "handle": "c1",
                    "name": "C1",
                    "description": "Desc1",
                    "numEmployees": 1,
                    "logoURL": "http://c1.img"
                }
            }
        });
    });

    test("Requests job that doesnt exist", async function () {
        const response = await request(app).get('/jobs/1');
        expect(response.statusCode).toEqual(404);
    });
})

/**======================================== PATCH /jobs/id */

describe("PATCH /jobs/id", function () {
    test("Working example", async function () {
        const response = await request(app).patch(`/jobs/${testJobIds[1]}`).send({ salary: 100 })
            .set("authorization", `Bearer ${adminToken}`);
        expect(response.body).toEqual({
            job: {
                id: expect.any(Number),
                title: "test3",
                salary: 100,
                equity: null,
                companyHandle: "c1"
            },
        });
    });

    test("Test id that doesnt exist", async function () {
        const response = await request(app).patch('/jobs/1').send({ title: "fail" })
            .set("authorization", `Bearer ${adminToken}`);
        expect(response.statusCode).toEqual(404);
    });

    test("Non-admin attempt", async function () {
        const response = await request(app).patch(`/jobs/${testJobIds[1]}`).send({ salary: 100 });
        expect(response.statusCode).toEqual(401);
    });
});


/**============================================= DELETE /jobs/id */

describe("DELETE /jobs/id", function () {
    test("Request sent by admin", async function () {
        const response = await request(app).delete(`/jobs/${testJobIds[0]}`)
            .set("authorization", `Bearer ${adminToken}`);
        expect(response.body).toEqual({ deleted: testJobIds[0].toString() });
    });

    test("Request from non admin", async function () {
        const response = await request(app).delete(`/jobs/${testJobIds[0]}`);
        expect(response.statusCode).toEqual(401);
    });

    test("Request for non existent job", async function () {
        const response = await request(app).delete(`/jobs/1`)
            .set("authorization", `Bearer ${adminToken}`);
        expect(response.statusCode).toEqual(404);
    });
})