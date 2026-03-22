export interface Location {
  id: number;
  name: string;
  x: string; // Формат: "53.6%"
  y: string; // Формат: "52%"
  width?: string; // Формат: "6%"
  height?: string; // Формат: "10%"
  opacity?: number; // 0 дан 1ге чейин
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  visualX?: string; // Пиндин визуалдык офсет X
  visualY?: string; // Пиндин визуалдык офсет Y
  handleX?: string; // Редактордогу кызыл рамканын X (Офсет туткасы)
  handleY?: string; // Редактордогу кызыл рамканын Y (Офсет туткасы)
  handleWidth?: string; // Редактордогу тутканын туурасы
  handleHeight?: string; // Редактордогу тутканын бийиктиги
  isHidden?: boolean; // Элементтин көрүнүү/көрүнбөө абалы
  content?: string; // Тексттин мазмуну (эгер бул текст элементи болсо)
  textAlign?: 'left' | 'center' | 'right';
  textShadowColor?: string;
  textShadowBlur?: number;
  textShadowOpacity?: number; // 0 да 1ге чейин
  interactionType?: 'none' | 'modal' | 'link' | 'popup'; // 'none': no interaction, 'modal': opens info window, 'link': external url portal, 'popup': expandable card
  link?: string; // Кайсыл шилтемеге алып барат
  animSpeed?: number; // Ылдамдык (мисалы 1 дан 5 га чейин)
  animAmplitude?: number; // Күчү (пиксель менен, мисалы 0 дан 20 га чейин)
  animNoise?: number; // Ызы-чуу кокустугу
  hoverOffsetX?: number; // Hover учурундагы X офсет
  hoverOffsetY?: number; // Hover учурундагы Y офсет
  parentId?: number; // Атасынын IDси (Sticky/Байланыш үчүн)
  stickyLag?: number; // Кечиктирүү секунда менен (0.0 — 1.0)
  imageUrl?: string; // Элементтин сүрөтүнүн шилтемеси (башкы иконка үчүн)
  scale?: number; // Элементтин визуалдык масштабы (0.1 — 5.0)
  textWidth?: string; // Тексттин кутусунун туурасы
  textHeight?: string; // Тексттин кутусунун бийиктиги
  sectionId?: number; // Кайсыл секцияга байланганы (Long Page)
  targetSceneId?: string; // Эгер Modal тандалса, кайсы сценага өтүү керек
  popupX?: string; // Поп-аптын X координаты
  popupY?: string; // Поп-аптын Y координаты
  popupWidth?: string; // Поп-аптын туурасы
  popupHeight?: string; // Поп-аптын бийиктиги
  isPopupExpanded?: boolean; // Поп-ап ачыкпы же жабыкпы
  popupContent?: string; // Поп-аптын өзүнчө тексти
  textBgColor?: string;
  textBgOpacity?: number;
  popupBgColor?: string;
  popupBgOpacity?: number;
  popupTextColor?: string;
  popupHeaderColor?: string;
}
export interface QuickLink {
  id: number;
  label: string;
  targetLocationId?: number; // Пинге байланса анын функциясын алат
  targetSceneId?: string; // Эгер пинге байланбаса, түздөн-түз сценаны ачат
  externalUrl?: string; // Же сырткы шилтеме
  icon?: string;
  order: number;
  // Visual Customization Properties
  fontFamily?: string;
  fontSize?: string;
  bgColor?: string;
  bgOpacity?: number;
  textColor?: string;
  scale?: number;
  iconSize?: string;
}
