# Коробка Архитектурасы — Деталдуу Сүрөттөмө

## Концепция

Ар бир "коробка" — өз алдынча модуль. Ичиндеги ар бир папка бир жоопкерчиликти аткарат:

| Папка | Аты | Максаты |
|---|---|---|
| `components/` | Дизайн + Сөөк | JSX компоненттер, визуалдык UI |
| `hooks/` | Мээ | React логикасы, state, handlers |
| `constants/` | Маалымат | Статикалык маалымат, конфигурация |
| `types/` | Кулпу | TypeScript interfaces, типтер |
| `MainMenuView.tsx` | Бириктирүүчү | Баарын бирге чогулткан View |

## `main-menu` Коробкасынын Абалы

### Types (Кулпу)
```typescript
// src/features/main-menu/types/index.ts
export interface Location {
  id: number;
  name: string;
  x: string; // Hitbox (Көк рамка) X 좌표
  y: string; // Hitbox (Көк рамка) Y 좌표
  visualX?: string; // Пин (Сүрөт) X 좌표
  visualY?: string; // Пин (Сүрөт) Y 좌표
  handleX?: string; // Handle (Кызыл рамка / Offset тутка) X 좌표
  handleY?: string; // Handle (Кызыл рамка / Offset тутка) Y 좌표
  // ... (размер жана стилдер)
}
```

### Constants (Маалымат)
```typescript
// src/features/main-menu/constants/locations.ts
export const LOCATIONS: Location[] = [
  { id: 1, name: 'Archive Fortress', x: '53.6%', y: '52%' },
  ...
]
```

### Hook (Мээ)
```typescript
// src/features/main-menu/hooks/useMainMenu.ts
// Мында: useState, event handlers, selection logic
```

### Components (Дизайн)
```
MapBackground.tsx  — fon.png чийүүчү компонент
MapIcon.tsx        — ар бир иконка + анимация
MissionModal.tsx   — жерди тандаганда ачылуучу модал
```

## Коробкалар аралык Туташуу Принципи

Коробкалар бири-бирин **болгону экспорт аркылуу** таанышат:

```typescript
// src/features/main-menu/index.ts  (Коробканын "эшиги")
export { MainMenuView } from './MainMenuView'
export type { Location } from './types'
```

Башка коробка `main-menu` ичин кирип, файлдарды түздөн-түз импорт кыла **АЛMAЙТ**. Болгону `index.ts` аркылуу.

## Болочокто кошуло турган коробкалар

```
features/
├── main-menu/        ✅ Иштелген
├── visual-editor/    ⏳ Фаза 2 (main-menu бүтүп кийин)
├── fortress/         ⏳ Пландалган
├── crystal-wells/    ⏳ Пландалган
├── surveyor-peak/    ⏳ Пландалган
├── traders-bazaar/   ⏳ Пландалган
└── golden-gate/      ⏳ Пландалган
```

---

## 🎨 Visual Editor (Шкура) Системасынын Архитектурасы

> Толук спецификация: `_docs/visual-editor/SPEC.md`

Шкура — отдельный "коробка". Ал башка коробкаларга кийлигишпейт, болгону UI кабатына гана тийет.

```
src/features/visual-editor/
├── index.tsx                  # Редактор'ду күйгүзөт/өчүрөт
├── context/
│   └── EditorContext.tsx      # isEditorMode, selectedElement state
├── toolbar/
│   ├── Toolbar.tsx            # Жогорку инструменттер панели
│   ├── MoveHandle.tsx         # Сүйрөп жылдыруу
│   ├── ResizeHandle.tsx       # Өлчөм өзгөртүү
│   ├── TextControls.tsx       # Font Size, Bold, Font Family
│   ├── ColorControls.tsx      # Contrast, Invert, Color Picker
│   └── SaveButton.tsx         # САКТОО (файлга жазат)
├── overlay/
│   └── SelectionOverlay.tsx   # Тандалган элементтин рамкасы
├── engine/
│   ├── dragEngine.ts          # px → % которуу логикасы
│   ├── resizeEngine.ts        # Resize логикасы
│   ├── codeWriter.ts          # constants/*.ts файлдарды жаңыртат
│   └── animationPauser.ts     # Framer Motion тоготуу
└── types/
    └── index.ts               # EditorGroup, EditorElement, ToolMode типтери

### 📂 Group State Management (Жаңы)

Группаларды башкаруу `EditorContext.tsx` ичиндеги `groups` объектиси аркылуу ишке ашат:

- **State:** `groups: Record<number, EditorGroup>`
- **Member Sync:** Ар бир группа `memberIds` тизмесин сактайт. Бул ИДлер глобалдык `layerOrder` массивинде кала берет. Бул тизмеден элементти өчүрбөстөн, аны Группанын ичинде визуалдык түрдө көрсөтүүгө мүмкүндүк берет.
- **Rendering Logic:** `Toolbar.tsx` тизмени рендеринг кылууда `layerOrder`ди тескери тартипте айланат. Эгер элемент Группанын мүчөсү болсо, ал Группа бир гана жолу `topLevelEntities` тизмесине кошулат. Башка мүчөлөр "өткөрүлүп" жиберилет.
- **Expansion:** Группа ачык болсо (`!isCollapsed`), анын ички элементтери `layerOrder` боюнча иреттелип, кайрадан рендеринг кылынат.

```typescript
interface EditorGroup {
  id: number;
  name: string;
  memberIds: number[];
  isCollapsed: boolean;
}
```

### Шкура ↔ main-menu туташуусу

```
visual-editor (Редактор) 
    ↓ isEditorMode берет
main-menu/MainMenuView.tsx 
    → animate={isEditorMode ? false : { y: [0,-8,0] }}

Колдонуучу элементти жылдырат
    → codeWriter.ts чакырылат
    → /api/editor/save API route
    → constants/locations.ts жаңыртылат
    → Next.js HMR браузерди жаңыртат
```
