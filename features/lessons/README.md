# lessons

The lesson engine and learning-path architecture (Part 6).

## Shape

```
Course
 └─ Level        (Getting Started, Urdu Letters, Words, ...)
     └─ Module   (a themed group of lessons within a level)
         └─ Lesson
             └─ content: explanation, examples, targetText, exercises
```

## Layout

- `types/` — `Lesson`, `Module`, `Level`, `Course`, `Exercise`, and their content shapes.
- `data/` — the curriculum itself, as plain data. `data/lessons/` holds one file
  per level (`level0.ts` … `level7.ts`) so the curriculum stays editable as it
  grows without one giant file. Nothing here imports React.
- `services/lessonCatalog.ts` — every lookup a page needs (by id, by module,
  by level, next/previous, full context + error reporting). Pages never read
  `data/` directly.
- `services/lessonStatus.ts` — **mock only**. Resolves the `locked` /
  `available` / `current` / `completed` status shown on `LessonCard`. Not
  backed by real progress or persistence yet — see "Out of scope" below.
- `hooks/useLesson.ts` — thin memoized wrapper over `getLessonContext`.
- `components/` — presentational pieces used by `/lesson/:id` and `/learn`.

## Out of scope for Part 6

Typing comparison, accuracy/WPM, timers, progress persistence,
completion tracking, and the Test Engine are **not** implemented here.
`LessonPractice` renders each exercise's `instruction`/`target` as a
prepared interface — the future Typing Engine will consume that same
`target` string without needing to know anything else about the lesson
it came from.
