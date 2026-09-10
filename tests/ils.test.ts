import {expect,it} from 'vitest';
import {validateCatalog,validateLesson} from '@aserdargun/lab-core';
import {manifest,experiments,guidedLesson,initialRoute,pair} from '../src/ils/catalog';
import concepts from '../src/ils/concepts.json';
import {scenarios} from '../src/core/scenarios';
import {lessons} from '../src/lessons/lessons';
it('maps actual scenarios, calculation provenance and existing lessons',()=>{
 expect(validateCatalog(manifest,experiments,[guidedLesson],concepts.map(c=>c.id))).toEqual([]);
 expect(experiments.map(e=>e.id)).toEqual(scenarios.map(s=>s.id));
 expect(experiments.map(e=>e.description)).toEqual(scenarios.map(s=>pair(s.description)));
 expect(validateLesson(guidedLesson).ok).toBe(true);
 expect(guidedLesson.steps.map(s=>s.explanation)).toEqual(lessons.map(c=>pair(c.body)));
 expect(manifest.evidence.find(e=>e.id==='defaults')?.verificationStatus).toBe('unverified');
 expect(manifest.evidence.find(e=>e.id==='results')?.calculatedFrom).toEqual(['defaults','inputs']);
});
it('accepts authored routes only and ignores unsupported context',()=>{
 expect(initialRoute('?scenario=privacy&ils=not-json')).toEqual({scenario:'privacy',lesson:false});
 expect(initialRoute('?scenario=constructor&lesson=deployment-101')).toEqual({scenario:'team70',lesson:true});
});
