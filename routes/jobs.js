"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { checkIfAdmin } = require("../middleware/auth");
const Job = require("../models/jobs");

const jobCreateSchema = require("../schemas/jobCreateSchema.json");
const jobFilterSchema = require("../schemas/jobFilterSchema.json");
const jobUpdateSchema = require("../schemas/jobUpdateSchema.json")

const router = new express.Router();


/** POST / to create a new job, admin only
 * 
 * Request body should contain {title, salary, equity and companyHandle}
 * 
 * Only title and companyHandle are required
 */

router.post("/", checkIfAdmin, async function (req, res, next) {

    try {
        const validator = jsonschema.validate(req.body, jobCreateSchema)
        if (!validator.valid) {
            const errors = validator.errors.map(e => e.stack)
            throw new BadRequestError(errors)
        }
        const job = await Job.create(req.body);
        return res.status(201).json({ job })
    } catch (error) {
        return next(error)
    }
});


/**
 * GET / - gets all jobs, no authorizaiton on this route
 * 
 * Can pass optiontional filters - title,hasEquity, and minSalary
 */

router.get("/", async function (req, res, next) {

    const filters = req.query;
    if (filters.minSalary) {
        filters.minSalary = Number(filters.minSalary)
    }
    filters.hasEquity = filters.hasEquity === "true"

    try {
        const validator = jsonschema.validate(filters, jobFilterSchema);
        if (!validator.valid) {
            const errors = validator.errors.map(e => e.stack);
            throw new BadRequestError(errors)
        }
        const jobs = await Job.findAll(filters);
        return res.json({ jobs })
    } catch (error) {
        return next(error)
    }
});

/**
 * GET /id - gets specific job based on ID
 * 
 * Returns 404 notfounderror if the ID is invalid
 * 
 * Returns {id,title,salary,equity,company} if the ID is valid
 * 
 * Company is an object containing all of the info about the company that the job 
 * belongs to
 */

router.get("/:id", async function (req, res, next) {
    try {
        const job = await Job.get(req.params.id);
        return res.json({ job })
    } catch (error) {
        return next(error);
    }
})


/** 
 * PATCH /id - requires admin permissions
 * 
 * Updating the ID or the company are not options
 * 
 * Can take {title,salary,equity} to update from the request body
 */

router.patch("/:id", checkIfAdmin, async function (req, res, next) {
    if (Object.keys(req.body).length === 0) {
        return res.json({ "Failed": "No properties were passed to update." })
    }
    console.log(req.body)
    try {
        const validator = jsonschema.validate(req.body, jobUpdateSchema);
        if (!validator.valid) {
            const errors = validator.errors.map(e => e.stack);
            throw new BadRequestError(errors);
        }

        const job = await Job.update(req.params.id, req.body);
        console.log(job)
        return res.json({ job });
    } catch (err) {
        return next(err);
    }
})

/** DELETE /id - required admin permissions
 * 
 * returns {deleted: id}
 */


router.delete("/:id", checkIfAdmin, async function (req, res, next) {
    try {
        await Job.remove(req.params.id);
        return res.json({ deleted: req.params.id });
    } catch (error) {
        return next(error)
    }
})

module.exports = router;