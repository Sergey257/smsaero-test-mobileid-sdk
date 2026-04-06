declare module 'mobileid-sdk' {

  interface MobileIDOptions {
    /** URL клиентского backend для получения init-токена */
    tokenUrl: string;
    /** URL MobileID backend (переопределяет глобальный) */
    baseUrl?: string;
    /** Код страны для нормализации (по умолчанию 'RU') */
    country?: string;
    /** Макс. количество тихих перезапусков (по умолчанию 2) */
    maxRetries?: number;
  }

  interface ConfigureOptions {
    baseUrl?: string;
  }

  interface PhoneResult {
    phone?: string;
    error?: string;
  }

  interface CountryInfo {
    code: string;
    prefix: string;
    length: number;
  }

  interface ReadyEvent { session_id: string }
  interface PendingEvent { phone: string }
  interface VerifiedEvent { verify_token: string | null }
  interface RejectedEvent { verify_token: string | null }
  interface ExpiredEvent { verify_token: string | null }
  interface InvalidCodeEvent { message: string }
  interface ErrorEvent { code: string; message: string; status?: number }

  type EventMap = {
    ready: ReadyEvent;
    pending: PendingEvent;
    otp_required: {};
    verified: VerifiedEvent;
    rejected: RejectedEvent;
    expired: ExpiredEvent;
    invalid_code: InvalidCodeEvent;
    error: ErrorEvent;
  }

  export class MobileID {
    constructor(options: MobileIDOptions);

    /** Глобальная настройка — вызывать до создания экземпляров */
    static configure(config: ConfigureOptions): void;
    /** Список поддерживаемых стран */
    static countries(): CountryInfo[];
    /** Нормализация номера (статический метод) */
    static normalizePhone(phone: string, country: string): PhoneResult;

    on<K extends keyof EventMap>(event: K, callback: (data: EventMap[K]) => void): this;
    off<K extends keyof EventMap>(event: K, callback: (data: EventMap[K]) => void): this;

    /** Инициализация: fingerprint → токен → сессия */
    init(): Promise<void>;
    /** Запуск верификации номера */
    start(phone: string): Promise<void>;
    /** Отправка OTP-кода */
    submitOTP(code: string): Promise<void>;
    /** Тихая перезагрузка цикла */
    silentRetry(): Promise<void>;
    /** Нормализация номера */
    normalizePhone(phone: string, country?: string): PhoneResult;

    getPhone(): string | null;
    getSessionId(): string | null;
    getFingerprintHash(): string | null;
    /** idle | ready | pending | otp | final */
    getState(): string;
    destroy(): void;
  }

  export default MobileID;
}
