import { copyFile, mkdir, writeFile, readFile } from 'node:fs/promises'
import { catalogLessons } from '../../src/data/catalog/index.ts'

await mkdir(new URL('../catalog/', import.meta.url), { recursive: true })
const enterpriseCurriculum = JSON.parse(await readFile(new URL('../../shared/enterpriseCurriculum.json', import.meta.url),'utf8'))
const enterpriseAssessment = JSON.parse(await readFile(new URL('../../shared/enterpriseAssessmentKeys.json', import.meta.url),'utf8'))
if (!Number.isSafeInteger(enterpriseCurriculum.version) || enterpriseCurriculum.version<1 || enterpriseAssessment.version!==enterpriseCurriculum.version) throw new Error('Enterprise curriculum and private assessment must share one published version.')
await copyFile(new URL('../../shared/enterpriseCurriculum.json', import.meta.url), new URL('../catalog/enterpriseCurriculum.json', import.meta.url))
await copyFile(new URL('../../shared/enterpriseAssessmentKeys.json', import.meta.url), new URL('../catalog/enterpriseAssessmentKeys.json', import.meta.url))
await copyFile(new URL('../../src/data/enterprisePractices.json', import.meta.url), new URL('../catalog/enterprisePractices.json', import.meta.url))
await copyFile(new URL('../../shared/enterprisePracticeRubrics.json', import.meta.url), new URL('../catalog/enterprisePracticeRubrics.json', import.meta.url))
await writeFile(new URL('../catalog/learning.json', import.meta.url), JSON.stringify(catalogLessons.map(lesson => ({ id: lesson.id, cardIds: lesson.cardIds }))))
await copyFile(new URL('../../shared/challengeDossiers.json', import.meta.url), new URL('../catalog/challengeDossiers.json', import.meta.url))
await copyFile(new URL('../../docs/content/curriculum.json', import.meta.url), new URL('../catalog/curriculum.json', import.meta.url))
await copyFile(new URL('../../shared/challengeQuestions.json', import.meta.url), new URL('../catalog/challengeQuestions.json', import.meta.url))
await copyFile(new URL('../../shared/challengeAnswerKeys.json', import.meta.url), new URL('../catalog/challengeAnswerKeys.json', import.meta.url))

await copyFile(new URL('../../shared/challengeQuestions.v3.json', import.meta.url), new URL('../catalog/challengeQuestions.v3.json', import.meta.url))
await copyFile(new URL('../../shared/challengeAnswerKeys.v3.json', import.meta.url), new URL('../catalog/challengeAnswerKeys.v3.json', import.meta.url))
