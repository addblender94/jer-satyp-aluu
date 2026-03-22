# Коробкалардын Статусу (Features List)

Бул файлда ар бир коробканын максаты, статусу жана аткарылган иштер жазылат.

---

## ✅ `main-menu` — Башкы Карта

**Максаты:** Оюнчуга оюн картасын көрсөтүү, иконкаларга баруу үчүн интерактивдүү интерфейс.

**Статус: ИШТЕТИЛГЕН (активити)**

**Иштелген нерселер:**
- [x] Фондук карта толук экранды жаба тургандай орнотулду
- [x] 5 иконка туура позицияда фондун үстүндө турат
- [x] Hover эффект: иконка жогору секирет + жарыктанат
- [x] Иконканы басканда туура модал ачылат
- [x] Hitbox'тордун координаттары иконкалардын ортосуна туура келтирилди

**Азыркы Файлдар:**
```
src/app/page.tsx   — убактылуу, кийин features/ га өтөт
```

**Кийинки кадамдар:**
- [ ] `src/features/main-menu/` папкасына бөлүп чыгаруу
- [ ] Пландалган 5 модул үчүн коробкаларды түзүү

---

## ✅ `visual-editor` — Шкура Редактору

**Максаты:** Оюндун UI кабатын кодго тийбей, визуалдык түрдө өзгөртүү жана сактоо.

**Статус: ИШТЕТИЛГЕН (Phase 1-14)**

**Иштелген нерселер:**
- [x] Позициялоо (X, Y) жана Өлчөм (Width, Height) башкаруу
- [x] Тексттик стилдер (Font, Color, Shadow, Align)
- [x] Анимация мотору (Speed, Amplitude, Noise)
- [x] Sticky / Parent-Child кечигүү эффектиси
- [x] **Layers & Grouping:** Elements are organized in a list with visibility toggles, dynamic numbering, and grouping (folders).
- [x] **Section Filtering:** Filter layers by background section to manage long pages section-by-section.
- [x] **Auto-Territory:** Elements automatically reassign their parent section when dragged and dropped across different background areas.
- [x] **Rename Tool:** Inline renaming for both elements and groups.
- [x] Катмарларды башкаруу (Layers UI):
    - [x] Динамикалык номерлөө (этаж боюнча)
    - [x] Группалоо жана папкаларды башкаруу
    - [x] Интерактивдүү ички элементтер
    - [x] Rename (✏️) инструменти
- [x] Мульти-секциялык сактоо (Backgrounds & Locations)

**Азыркы Файлдар:**
```
src/features/visual-editor/
```

---

## ⏳ `fortress` — Archive Fortress Модулу

**Статус: ПЛАНДАЛГАН**

---

## ⏳ `crystal-wells` — Crystal Wells Модулу

**Статус: ПЛАНДАЛГАН**

---

## ⏳ `surveyor-peak` — Surveyor Peak Модулу

**Статус: ПЛАНДАЛГАН**

---

## ⏳ `traders-bazaar` — Traders Bazaar Модулу

**Статус: ПЛАНДАЛГАН**

---

## ⏳ `golden-gate` — The Golden Gate Модулу

**Статус: ПЛАНДАЛГАН**
