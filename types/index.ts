// Domain types — mirror the future backend (Prisma) schema 1:1.

export type CourseLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL_LEVELS";
export type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type LessonType = "VIDEO" | "DOCUMENT" | "QUIZ" | "LIVE";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  coursesCount: number;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatarUrl?: string | null;
  phone?: string | null;
  city?: string | null;
  headline?: string | null;
  bio?: string | null;
}

export interface Instructor {
  id: string;
  userId?: string;
  name: string;
  slug?: string;
  headline?: string;
  biography?: string;
  avatarUrl?: string;
  rating?: number;
  reviewsCount?: number;
  studentsCount?: number;
  coursesCount?: number;
  createdAt?: string;
  user?: UserProfile;
}

export interface Requirement {
  id: string;
  courseId: string;
  description?: string;
  text?: string;
  position: number;
}

export interface LearningOutcome {
  id: string;
  courseId: string;
  description?: string;
  text?: string;
  position: number;
}

/** Onde um recurso de media realmente vive — ver
 *  backend_unitec/src/integrations/media. "external" cobre os links
 *  antigos colados à mão cujo provider nunca foi registado. */
export type MediaProviderName = "cloudinary" | "local" | "minio" | "vimeo" | "external" | string;

export interface LessonResource {
  id: string;
  lessonId: string;
  title?: string;
  url: string;
  /** Espelha o `enum ResourceType` do LMS (faltavam DOCUMENT e IMAGE, que o
   *  backend grava e o leitor tem de reconhecer); "AUDIO"/"OTHER" ficam como
   *  tolerância a linhas antigas. */
  resourceType?:
    | "VIDEO" | "PDF" | "DOCUMENT" | "ZIP" | "LINK" | "IMAGE" | "CODE"
    | "AUDIO" | "OTHER" | string;
  provider?: MediaProviderName;
  assetId?: string | null;
  thumbnailUrl?: string | null;
  durationInSeconds?: number | null;
  isDownloadable?: boolean;
  position?: number;
  name?: string;
  sizeKb?: number;
  type?: string;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description?: string | null;
  lessonType?: LessonType;
  type?: LessonType;
  durationInSeconds?: number;
  durationMinutes?: number;
  isPreview: boolean;
  position: number;
  resources?: LessonResource[];
}

/** Resposta de `GET /courses/:id/content` — a única que traz os recursos de
 *  cada aula, e só para quem está matriculado. */
export interface CourseContent {
  courseId: string;
  modules: (Module & { lessons: Lesson[] })[];
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  position: number;
  lessons: Lesson[];
}

export interface Review {
  id: string;
  courseId: string;
  authorName: string;
  authorAvatarUrl: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export type CoursePackageCode = "ESSENTIAL" | "STANDARD" | "INTERACTIVE";

export interface CoursePackageInfo {
  package: CoursePackageCode;
  enabled: boolean;
  /** Preço final do pacote (base com desconto × fator). */
  price: number;
  /** Preço do pacote SEM desconto (base original × fator). */
  originalPrice: number;
  hasDiscount: boolean;
  discountPercentage: number | null;
}

export interface CoursePricing {
  /** Preço base do curso, sem desconto. */
  price: number;
  discountPercentage: number | null;
  /** Preço base já com desconto aplicado. */
  discountedPrice: number;
  hasDiscount: boolean;
  packages: CoursePackageInfo[];
  /** Preço do certificado nos pacotes Essencial e Padrão (o Interativo inclui-o). 0 = incluído em todos. */
  certificatePrice?: number;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  /** Texto longo que o painel pede "para a página de detalhes do curso". */
  longDescription?: string | null;
  thumbnailUrl: string;
  trailerUrl: string | null;
  categoryId: string;
  instructorId: string;
  level: CourseLevel;
  language: string;
  format: "ONLINE" | "PRESENCIAL" | "HIBRIDO";
  status: CourseStatus;
  price: number;
  discountPercentage: number | null;
  pricing: CoursePricing;
  rating: number;
  reviewsCount: number;
  studentsCount: number;
  durationMinutes: number;
  lessonsCount: number;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNew: boolean;
  seoTitle: string;
  seoDescription: string;
  createdAt: string;
  updatedAt: string;
  requirements: Requirement[];
  outcomes: LearningOutcome[];
  modules: Module[];
  reviews: Review[];
}

/** Course joined with its relations — what list/detail endpoints will return. */
export interface CourseWithRelations extends Course {
  category: Category;
  instructor: Instructor;
}

// `CourseSort`/`CourseFiltersState` viviam aqui e descreviam filtros que o LMS
// nunca soube responder (idiomas, avaliação mínima, durações, "discounted").
// Os filtros reais do catálogo — e a sua tradução para a API — estão agora em
// `lib/catalog.ts`, num sítio só, para não voltarem a divergir.

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
