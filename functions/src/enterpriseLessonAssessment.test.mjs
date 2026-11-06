import test from 'node:test'
import assert from 'node:assert/strict'
import { advanceEnterpriseLessonAssessment, assertEnterpriseLessonAssessmentPassed, usesEnterpriseLessonAssessment } from './enterpriseLessonAssessment.mjs'

const lesson = {id:'ent-answer-or-action',steps:[
  {id:'q1',type:'question',prompt:'Premier choix',correctOptionId:'a',options:[{id:'a',text:'Oui',feedback:'Explication oui'},{id:'b',text:'Non',feedback:'Explication non'}]},
  {id:'q2',type:'question',prompt:'Second choix',correctOptionId:'b',options:[{id:'a',text:'Oui',feedback:'Explication oui'},{id:'b',text:'Non',feedback:'Explication non'}]},
]}
const version = 'a'.repeat(64)
const now = Date.parse('2026-11-06T11:00:00Z')
const answer = (previous,question,option,date=now,contentVersion=version) => advanceEnterpriseLessonAssessment(previous,lesson,question,option,contentVersion,date)

test('every Enterprise lesson with questions requires an assessment, independent of its ID',()=>{
  assert.equal(usesEnterpriseLessonAssessment(lesson),true)
  assert.equal(usesEnterpriseLessonAssessment({...lesson,id:'ent-any-other-lesson'}),true)
  assert.equal(usesEnterpriseLessonAssessment({id:'ent-without-questions',steps:[{type:'message',text:'A teaching message'}]}),false)
  assert.equal(usesEnterpriseLessonAssessment(undefined),false)
})

test('lesson assessment freezes each first answer and accepts identical retries',()=>{
  const first = answer(undefined,'q1','b').assessment
  assert.equal(first.correct,0)
  assert.equal(first.finished,false)
  assert.equal(first.checks[0].correctOptionId,'a')
  assert.equal(first.checks[0].explanation,'Explication non')
  assert.deepEqual(answer(first,'q1','b'),{changed:false,assessment:first})
  assert.throws(()=>answer(first,'q1','a'),{code:'already-exists'})
  assert.throws(()=>answer(undefined,'q2','b'),{code:'failed-precondition'})
  assert.throws(()=>answer(first,'q2','invented'),{code:'invalid-argument'})
  assert.throws(()=>answer(first,'q2','b',now,'b'.repeat(64)),{code:'failed-precondition'})
})

test('failed lesson attempts permit a new attempt only after the next Paris midnight',()=>{
  const first = answer(undefined,'q1','b').assessment
  const failed = answer(first,'q2','b').assessment
  assert.equal(failed.finished,true)
  assert.equal(failed.passed,false)
  assert.equal(failed.correct,1)
  assert.equal(failed.retryAt,'2026-11-06T23:00:00.000Z')
  assert.throws(()=>answer(failed,'q1','a',Date.parse(failed.retryAt)-1),{code:'already-exists'})
  const restarted = answer(failed,'q1','a',Date.parse(failed.retryAt)).assessment
  assert.equal(restarted.attemptDay,'2026-11-07')
  assert.deepEqual(restarted.answers,{q1:'a'})
  assert.equal(restarted.finished,false)
  assert.equal(failed.answers.q1,'b')
  assert.throws(()=>assertEnterpriseLessonAssessmentPassed(failed,version),{code:'failed-precondition'})
})

test('passing requires all correct answers and the exact current content version',()=>{
  const passed = answer(answer(undefined,'q1','a').assessment,'q2','b').assessment
  assert.equal(passed.passed,true)
  assert.equal(passed.retryAt,null)
  assert.doesNotThrow(()=>assertEnterpriseLessonAssessmentPassed(passed,version))
  assert.throws(()=>assertEnterpriseLessonAssessmentPassed(passed,'b'.repeat(64)),{code:'failed-precondition'})
  assert.throws(()=>assertEnterpriseLessonAssessmentPassed(undefined,version),{code:'failed-precondition'})
})

test('retry time follows Paris daylight savings and completion day for interrupted attempts',()=>{
  const start = Date.parse('2026-03-28T20:00:00Z')
  const first = answer(undefined,'q1','b',start).assessment
  const end = Date.parse('2026-03-29T20:00:00Z')
  const failed = answer(first,'q2','b',end).assessment
  assert.equal(failed.attemptDay,'2026-03-28')
  assert.equal(failed.retryAt,'2026-03-29T22:00:00.000Z')
  assert.throws(()=>answer(failed,'q1','a',end+1),{code:'already-exists'})
})

test('changed content restarts an uncommitted pass or partial attempt without reopening a failed day',()=>{
  const first = answer(undefined,'q1','a').assessment
  const passed = answer(first,'q2','b').assessment
  const changedVersion = 'b'.repeat(64)
  const restarted = answer(passed,'q1','a',now+1,changedVersion).assessment
  assert.equal(restarted.contentVersion,changedVersion)
  assert.equal(restarted.finished,false)
  assert.deepEqual(restarted.answers,{q1:'a'})
  assert.equal(answer(first,'q1','b',now+1,changedVersion).assessment.answers.q1,'b')
  const failed = answer(answer(undefined,'q1','b').assessment,'q2','b').assessment
  assert.throws(()=>answer(failed,'q1','a',now+1,changedVersion),{code:'resource-exhausted'})
  assert.equal(answer(failed,'q1','a',Date.parse(failed.retryAt),changedVersion).assessment.contentVersion,changedVersion)
})
