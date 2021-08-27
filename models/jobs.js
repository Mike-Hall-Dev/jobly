"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError")
const { sqlForPartialUpdate } = require("../helpers/sql");


class Job {

    /**
     * Creates a job from data object passed, inserts job into database and returns the job data
     * 
     * 
     */
    static async create(data) {
        const res = await db.query(
            `INSERT INTO jobs (title,salary,equity,company_handle)
            VALUES ($1, $2, $3, $4)
            RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
            [data.title, data.salary, data.equity, data.companyHandle]);
        let job = res.rows[0];

        return job;
    }

    /**
     * Finds all jobs
     * 
     * There are 3 optional filters - title, minSalary and hasEquity
     * 
     * Returns [{id, title, salary, equity, companyHandle, companyName}]
     */
    static async findAll({ title, minSalary, hasEquity } = {}) {
        let jobQuery = `SELECT job.id,job.title,job.salary,job.equity,
                        job.company_handle AS "companyHandle",
                        c.name AS "companyName" FROM jobs job 
                        LEFT JOIN companies AS c ON c.handle = job.company_handle`;

        let whereClause = [];
        let values = [];

        if (title != undefined) {
            values.push(`%${title}%`)
            whereClause.push(`title ILIKE $${values.length}`);
        }

        if (minSalary != undefined) {
            values.push(minSalary)
            whereClause.push(`salary >= $${values.length}`);
        }
        if (hasEquity === true) {
            whereClause.push(`equity > 0`);
        }

        if (whereClause.length > 0) {
            jobQuery += " WHERE " + whereClause.join(" AND ");
        }

        jobQuery += " ORDER BY title";
        const result = await db.query(jobQuery, values)
        return result.rows;
    }

    /**
     * Uses job IDs as unique identifier to search for a specific job
     * 
     * Returns { id, title, salary, equity, companyHandle, company}
     */
    static async get(id) {
        const jobResponse = await db.query(
            `SELECT id,title,salary,equity,company_handle as "companyHandle"
            FROM jobs WHERE id = $1`, [id]);

        const job = jobResponse.rows[0];
        if (!job) {
            throw new NotFoundError(`Error no job found with id ${id}`)
        }

        const companiesResponse = await db.query(
            `SELECT handle,name,description,num_employees AS "numEmployees",
            logo_url AS "logoURL" FROM companies WHERE handle = $1`,
            [job.companyHandle]);

        delete job.companyHandle;
        job.company = companiesResponse.rows[0];

        return job;
    };

    /**
     * Updates job with data object
     * 
     * This is a partial update, it will only change provided fields
     * 
     * Returns {id,title,salary,equity and companyHandle} and throws error if not found
     * 
     */
    static async update(id, data) {
        const { setCols, values } = sqlForPartialUpdate(
            data,
            {});
        const idIdx = "$" + (values.length + 1);

        const querySql = `UPDATE jobs 
                          SET ${setCols} 
                          WHERE id = ${idIdx} 
                          RETURNING id, 
                                    title, 
                                    salary, 
                                    equity, 
                                    company_handle as "companyHandle"`;
        const result = await db.query(querySql, [...values, id]);
        const job = result.rows[0];

        if (!job) throw new NotFoundError(`No company: ${id}`);

        return job;
    }

    /**
     * Deletes job with provided ID
     * 
     * Throws errors if job not found
     */
    static async remove(id) {
        const result = await db.query(
            `DELETE
            FROM jobs
            WHERE id  = $1
            RETURNING id`, [id]);
        const job = result.rows[0];

        if (!job) throw new NotFoundError(`No job to delete with id ${id}`)
    }
}


module.exports = Job;