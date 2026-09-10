import {parseManifest, type ExperimentDefinition, type LessonDefinition} from '@aserdargun/lab-core';
import raw from '../../lab.manifest.json';
import rawExperiments from './experiments.json';
import {lessons} from '../lessons/lessons';
export const manifest=parseManifest(raw);
export const experiments=rawExperiments as ExperimentDefinition<{scenarioId:string}>[];
export const pair=(v:readonly string[])=>({en:v[0],tr:v[1]});
export const guidedLesson:LessonDefinition={schemaVersion:'0.1',id:'deployment-101',title:manifest.lessons![0].title,concepts:manifest.concepts,steps:lessons.map((c,i)=>({id:`chapter-${i+1}`,title:pair(c.title),explanation:pair(c.body),completion:{kind:'manual'}}))};
export function initialRoute(search:string){const p=new URLSearchParams(search);return {scenario:experiments.find(e=>e.id===p.get('scenario'))?.id??'team70',lesson:p.get('lesson')===guidedLesson.id};}
