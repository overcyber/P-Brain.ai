const path = require('path')
const fs = require('fs')
const express = require('express')

const getDirectories = srcpath =>
    fs.readdirSync(srcpath).filter(file =>
        fs.statSync(path.join(srcpath, file)).isDirectory())

const skills = []

function * loadSkills(skillsApi, io) {
    skillsApi.get('/', (req, res) => {
        const skillNames = []
        skills.map(skill => {
            if (skill.intent) {
                skillNames.push(skill.name)
            }
        })
        res.json(skillNames)
    })

    const skills_dir = __dirname.replace('/api', '')
    const dirs = getDirectories(skills_dir)

    dirs.map(dir => {
        const skill = require(`./${dir}`)
        skill.name = dir
        skills.push(skill)

        if (typeof (skill.register) === 'function') {
            const localSkillApi = express()
            skillsApi.use('/' + skill.intent().module, localSkillApi)
            skill.register(localSkillApi, io)
        }
    })
}

function registerClient(socket) {
    skills.map(skill => {
        if (typeof (skill.registerClient) === 'function') {
            skill.registerClient(socket)
        }
    })
}

function getSkills() {
    return skills
}

module.exports = {
    loadSkills,
    getSkills,
    registerClient
}
