enum AnswerCode {
    success = 0,
    TonStorageFilesNotFound = 9,
    TonStorageFileAlreadyExist = 10,
    TonStorageRemovedFile = 12,
    TonVaultWrongPubKey = 7,
    TonVaultUserNotFound = 8,
    TonVaultEmptyBagIdArray = 11,
    TonProofDoesNotExist = 13,
    TonProofErrorPresent = 14,
    TonProofNoPubKey = 15,
    TonProofInvalidSignature = 16,
    TonProofExpired = 17,
}

const AnswerDescription = new Map<AnswerCode, string>();
AnswerDescription.set(AnswerCode.success, 'Success');
AnswerDescription.set(AnswerCode.TonStorageFilesNotFound, 'Files not found');
AnswerDescription.set(AnswerCode.TonStorageFileAlreadyExist, 'File already exist');
AnswerDescription.set(AnswerCode.TonStorageRemovedFile, 'File has been removed');
AnswerDescription.set(AnswerCode.TonVaultWrongPubKey, 'Wrong public key');
AnswerDescription.set(AnswerCode.TonVaultUserNotFound, 'User not found');
AnswerDescription.set(AnswerCode.TonVaultEmptyBagIdArray, 'Empty bagId array');
AnswerDescription.set(AnswerCode.TonProofDoesNotExist, 'Ton proof does not exist');
AnswerDescription.set(AnswerCode.TonProofErrorPresent, 'Ton proof error from tonConnect');
AnswerDescription.set(AnswerCode.TonProofNoPubKey, 'No public key');
AnswerDescription.set(AnswerCode.TonProofInvalidSignature, 'Invalid signature');
AnswerDescription.set(AnswerCode.TonProofExpired, 'Ton proof expired');

export { AnswerCode, AnswerDescription };
