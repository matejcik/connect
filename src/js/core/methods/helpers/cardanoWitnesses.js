/* @flow */
import type { CertificateWithPoolOwnersAndRelays } from './cardanoCertificate';
import type { InputWithPath, Path } from '../CardanoSignTransaction';
import { Enum_CardanoCertificateType as CardanoCertificateType } from '../../../types/trezor/protobuf';
import type { CardanoTxWithdrawal } from '../../../types/trezor/protobuf';

export const gatherWitnessPaths = (
    inputsWithPath: InputWithPath[],
    certificatesWithPoolOwnersAndRelays: CertificateWithPoolOwnersAndRelays[],
    withdrawals: CardanoTxWithdrawal[],
): Path[] => {
    const witnessPaths = new Map<string, Path>();
    function _insert(path: Path) {
        const pathKey = JSON.stringify(path);
        witnessPaths.set(pathKey, path);
    }

    inputsWithPath.forEach(({ path }) => {
        if (path) _insert(path);
    });

    certificatesWithPoolOwnersAndRelays.forEach(({ certificate, poolOwners }) => {
        if (
            certificate.path &&
            (certificate.type === CardanoCertificateType.STAKE_DELEGATION ||
                certificate.type === CardanoCertificateType.STAKE_DEREGISTRATION)
        ) {
            _insert(certificate.path);
        }
        poolOwners.forEach(poolOwner => {
            if (poolOwner.staking_key_path) {
                _insert(poolOwner.staking_key_path);
            }
        });
    });

    withdrawals.forEach(({ path }) => _insert(path));

    return Array.from(witnessPaths.values());
};
