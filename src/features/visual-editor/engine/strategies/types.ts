/**
 * strategies/types.ts
 * 
 * "ЖИП" — Бардык инструменттерди (Element, Hitbox, Visual) бириктирген
 * стандарт интерфейс. Ар бир инструмент бул интерфейсти ишке ашырат.
 * 
 * Бул файлды ӨЗГӨРТҮҮ — баардык инструменттерге таасир этет.
 * Ошондуктан муну 100% зарыл болгондо гана оңдоңуз.
 */

// === Кыймыл (Move) үчүн баштапкы абал ===
export interface DragState {
  initialHx: number;
  initialHy: number;
  initialVx: number;
  initialVy: number;
  initialHandleX: number;
  initialHandleY: number;
  initialPx: number;
  initialPy: number;
}

// === Өлчөм (Resize) үчүн баштапкы абал ===
export interface ResizeState {
  initialHx: number;
  initialHy: number;
  initialHandleX: number;
  initialHandleY: number;
  initialHw: number;
  initialHh: number;
  initialScale: number;
  initialDist: number;
  initialPw: number;
  initialPh: number;
}

// === Кыймыл жыйынтыгы ===
export interface MoveResult {
  hx: string;
  hy: string;
  vx: string;
  vy: string;
  handleX: string;
  handleY: string;
  rawHx: number;
  rawHy: number;
  rawHandleX: number;
  rawHandleY: number;
  px?: string;
  py?: string;
}

// === Өлчөм жыйынтыгы ===
export interface ResizeResult {
  hw: string;
  hh: string;
  scale: number;
  pw?: string;
  ph?: string;
}

// === Resize контекст (чычкан + контейнер маалыматы) ===
export interface ResizeContext {
  mouseX: number;
  mouseY: number;
  startX: number;
  startY: number;
  isText: boolean;
  containerWidth: number;
  containerHeight: number;
  el: any;
  dxPx?: number;
  dyPx?: number;
}

/**
 * InteractionStrategy — Ар бир инструменттин "characters" (мүнөзү).
 * 
 * Ар бир инструмент (Element, Hitbox, Visual) бул интерфейсти ишке ашырат.
 * Алар бири-биринен ТОЛУК БӨЛҮНгөн. Бирин өзгөртүү экинчисин БУЗА АЛБАЙТ.
 */
export interface InteractionStrategy {
  /** Кыймылды эсептөө */
  calculateMove(dx: number, dy: number, state: DragState, isFullLayer: boolean): MoveResult;
  
  /** Өлчөмдү эсептөө */
  calculateResize(state: ResizeState, ctx: ResizeContext): ResizeResult;
}
