'use strict';
const IssueModel = require('../models').Issue
const ProjectModel = require('../models').Project

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(async (req, res) => {
      let projectName = req.params.project;
    
      try {
        let project = await ProjectModel.findOne({name: projectName});
        if (!project) {
          res.json({error: 'Project not found'});
          return;
        } else {
          const issues = await IssueModel.find({
            projectId: project._id, 
            ...req.query
          });
          if (!issues){
            res.json([{ error: 'no issues found' }]);
            return;
          }
          res.json(issues)
          return; 
        }
      } catch (error) {
        res.json({ error: 'could not find project'});
        return;
      }
    })
    
    .post(async (req, res) => {
      let projectName = req.params.project;
      const {issue_title, issue_text, created_by, assigned_to, status_text} = req.body;
      if(!issue_title || !issue_text || !created_by){
        res.json({error: 'required field(s) missing'});
        return;
      }
      try{
        let projectModel = await ProjectModel.findOne({name: projectName});
        if (!projectModel){
          projectModel = new ProjectModel({name: projectName});
          projectModel = await projectModel.save();
        } 
        const issueModel = new IssueModel({
          projectId: projectModel._id, 
          issue_title: issue_title || "", 
          issue_text: issue_text || "", 
          created_on: new Date(), 
          updated_on: new Date(), 
          created_by: created_by || "", 
          assigned_to: assigned_to || "", 
          open: true, 
          status_text: status_text || ""
        })
        issueModel.save()
        res.json(issueModel)
      }
      catch (error) {
        res.json({error: 'could not find'})
        return
      }
    })
    
    .put(async (req, res) => {
      let projectName = req.params.project;
      const {issue_title, issue_text, created_by, assigned_to, status_text, open} = req.body
      const _id = req.body._id
      if (!_id) {
        res.json({ error: 'missing _id' });
        return; 
      }
      if (!issue_title && !issue_text && !created_by && !assigned_to && !status_text && !open) {
        res.json({error: 'no update field(s) sent', '_id': _id });
        return;
      }
      try{
        let issueUpdate = await IssueModel.findOneAndUpdate({_id: _id}, {$set: {...req.body, updated_on: new Date()}});
        await issueUpdate.save();
        res.json({result: 'successfully updated', '_id': _id })
      }
      catch (err) {
        res.json({error: 'could not update', '_id': _id});
        return;
      }
    })
    
    .delete(async (req, res) => {
      let project = req.params.project;
      let _id = req.body._id
      if (!_id) {
        res.json({error: 'missing _id'})
        return
      }
      try {
        const projects = await ProjectModel.findOne({name: project});
        if(!projects){
          res.json({error: 'project does not exist'});
          return;
        }
        const issuseToDelete = await IssueModel.deleteOne({_id: _id, projectId: projects._id})
        if (issuseToDelete.deletedCount === 0) {
          throw new Error('ID not found');
        }
        res.json({result: 'successfully deleted', '_id': _id})
      }
      catch (error){
        res.json({error: 'could not delete', '_id': _id})
      }
    });
    
};
