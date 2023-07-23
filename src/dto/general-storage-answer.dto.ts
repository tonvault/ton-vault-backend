export interface GeneralStorageAnswerDto<T = string> {
    result: T;
    ok: boolean;
    code: number;
    error?: string;
}
