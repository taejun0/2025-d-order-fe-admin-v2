import * as S from './PaymentInfoForm.styled';
import { useState, useCallback, useMemo } from 'react';
import CommonInput from '../inputs/CommonInput';
import NextButton from '../buttons/NextButton';
import SignupComplete from '../modals/signupcomplete/SignupComplete';
import CommonDropdown from '../inputs/dropdown/CommonDropdown';

type Props = {
  formData: {
    accountHolder: string;
    bank: string;
    accountNumber: string;
    confirmPaymentPassword: string; // 결제 비밀번호(4자리)
    confirmPaymentPasswordCheck: string; // 비밀번호 확인
  };
  onChange: (key: keyof Props['formData'], value: string) => void;
  onNext: () => void;
  onSubmit: () => Promise<boolean>;
  paymentStage: number; // 1 -> 2 -> 3
  setPaymentStage: React.Dispatch<React.SetStateAction<number>>;
};

const BANK_OPTIONS = [
  'KB국민은행',
  '신한은행',
  '우리은행',
  '하나은행',
  'NH농협은행',
  'IBK기업은행',
  'SC제일은행',
  '한국씨티은행',
  '카카오뱅크',
  '케이뱅크',
  '토스뱅크',
  '부산은행',
  '경남은행',
  '대구은행',
  '광주은행',
  '전북은행',
  '제주은행',
  '수협은행',
  '산업은행',
];

const isValidAccountNumber = (value: string) => /^\d{8,14}$/.test(value);
const isValidPassword = (value: string) => /^\d{4}$/.test(value);

const PaymentInfoForm = ({
  formData,
  onChange,
  onSubmit,
  paymentStage,
  setPaymentStage,
}: Props) => {
  const [showComplete, setShowComplete] = useState(false);

  const {
    accountHolder,
    bank,
    accountNumber,
    confirmPaymentPassword,
    confirmPaymentPasswordCheck,
  } = formData;

  // 메시지 상태
  const [accountNumberError, setAccountNumberError] = useState<string | null>(
    null
  );
  const [accountNumberSuccess, setAccountNumberSuccess] = useState<
    string | null
  >(null);

  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);

  const [pwCheckError, setPwCheckError] = useState<string | null>(null);
  const [pwCheckSuccess, setPwCheckSuccess] = useState<string | null>(null);

  // ---- 유효성(Boolean) ----
  const isAccountHolderValid = useMemo(
    () => accountHolder.trim().length > 0,
    [accountHolder]
  );
  const isBankValid = useMemo(() => bank.trim().length > 0, [bank]);
  const isAccountNumberValid = useMemo(
    () => isValidAccountNumber(accountNumber),
    [accountNumber]
  );
  const isPwValid = useMemo(
    () => isValidPassword(confirmPaymentPassword),
    [confirmPaymentPassword]
  );
  const isPwMatch = useMemo(
    () =>
      confirmPaymentPasswordCheck.length > 0 &&
      confirmPaymentPasswordCheck === confirmPaymentPassword,
    [confirmPaymentPasswordCheck, confirmPaymentPassword]
  );

  const isFirstValid =
    isAccountHolderValid && isBankValid && isAccountNumberValid;
  const isSecondValid = paymentStage === 2 ? isPwValid : isPwValid && isPwMatch;

  // ---- 단계 이동 ----
  const handleNextStep = useCallback(() => {
    if (paymentStage === 2) {
      setPaymentStage(3);
      // 다음 단계로 넘어갈 때 비번 확인 메시지는 초기화
      setPwCheckError(null);
      setPwCheckSuccess(null);
    }
  }, [paymentStage, setPaymentStage]);

  const handleComplete = useCallback(async () => {
    const success = await onSubmit();
    if (success) setShowComplete(true);
  }, [onSubmit]);

  return (
    <S.Wrapper>
      {paymentStage === 1 && (
        <>
          <CommonInput
            label="예금주"
            placeholder="예) 이멋사"
            value={accountHolder}
            onChange={(e) => onChange('accountHolder', e.target.value)}
            success={isAccountHolderValid ? '사용 가능해요!' : undefined}
            onClear={() => onChange('accountHolder', '')}
          />

          <CommonDropdown
            label="은행"
            placeholder="은행 선택"
            value={bank}
            onChange={(e) => onChange('bank', e.target.value)}
            options={BANK_OPTIONS}
          />

          <CommonInput
            label="계좌번호"
            placeholder="예) 12341234"
            value={accountNumber}
            onChange={(e) => {
              const onlyDigits = e.target.value.replace(/[^\d]/g, ''); // 숫자만 허용(원치 않으면 제거)
              onChange('accountNumber', onlyDigits);

              if (!onlyDigits) {
                setAccountNumberError(null);
                setAccountNumberSuccess(null);
              } else if (isValidAccountNumber(onlyDigits)) {
                setAccountNumberError(null);
                setAccountNumberSuccess('사용 가능한 계좌번호예요!');
              } else {
                setAccountNumberError(
                  '-를 제외한 숫자 8~14자만 입력해 주세요.'
                );
                setAccountNumberSuccess(null);
              }
            }}
            error={accountNumberError ?? undefined}
            success={accountNumberSuccess ?? undefined}
            helperText="-를 제외한 숫자만 입력해 주세요."
            onClear={() => {
              onChange('accountNumber', '');
              setAccountNumberError(null);
              setAccountNumberSuccess(null);
            }}
            onResetValidation={() => {
              setAccountNumberError(null);
              setAccountNumberSuccess(null);
            }}
          />

          <NextButton
            onClick={() => setPaymentStage(2)}
            disabled={!isFirstValid}
          >
            다음
          </NextButton>
        </>
      )}

      {paymentStage >= 2 && (
        <>
          <CommonInput
            label="결제 비밀번호"
            placeholder="예) 1234"
            type="password"
            value={confirmPaymentPassword}
            onChange={(e) => {
              const onlyDigits = e.target.value.replace(/[^\d]/g, '');
              onChange('confirmPaymentPassword', onlyDigits);

              if (!onlyDigits) {
                setPwError(null);
                setPwSuccess(null);
              } else if (isValidPassword(onlyDigits)) {
                setPwError(null);
                setPwSuccess('사용 가능한 비밀번호예요!');
              } else {
                setPwError('4자리의 숫자를 입력해 주세요.');
                setPwSuccess(null);
              }

              // 비밀번호가 바뀌면 확인 일치 상태 재평가
              if (confirmPaymentPasswordCheck.length > 0) {
                if (onlyDigits === confirmPaymentPasswordCheck) {
                  setPwCheckError(null);
                  setPwCheckSuccess('비밀번호가 일치해요.');
                } else {
                  setPwCheckError('비밀번호가 일치하지 않아요.');
                  setPwCheckSuccess(null);
                }
              }
            }}
            error={pwError ?? undefined}
            success={pwSuccess ?? undefined}
            helperText="4자리의 숫자를 입력해 주세요."
            onClear={() => {
              onChange('confirmPaymentPassword', '');
              setPwError(null);
              setPwSuccess(null);
            }}
            onResetValidation={() => {
              setPwError(null);
              setPwSuccess(null);
            }}
            isVisible={paymentStage >= 2}
            disabled={paymentStage !== 2}
          />

          <CommonInput
            label="비밀번호 확인"
            placeholder="예) 1234"
            type="password"
            value={confirmPaymentPasswordCheck}
            onChange={(e) => {
              const onlyDigits = e.target.value.replace(/[^\d]/g, '');
              onChange('confirmPaymentPasswordCheck', onlyDigits);

              if (!onlyDigits) {
                setPwCheckError(null);
                setPwCheckSuccess(null);
              } else if (onlyDigits === confirmPaymentPassword) {
                setPwCheckError(null);
                setPwCheckSuccess('비밀번호가 일치해요.');
              } else {
                setPwCheckError('비밀번호가 일치하지 않아요.');
                setPwCheckSuccess(null);
              }
            }}
            error={pwCheckError ?? undefined}
            success={pwCheckSuccess ?? undefined}
            helperText="동일한 비밀번호를 입력해 주세요."
            onClear={() => {
              onChange('confirmPaymentPasswordCheck', '');
              setPwCheckError(null);
              setPwCheckSuccess(null);
            }}
            onResetValidation={() => {
              setPwCheckError(null);
              setPwCheckSuccess(null);
            }}
            forceShowPasswordWhenSuccess
            isVisible={paymentStage >= 3}
            disabled={paymentStage !== 3}
          />

          <NextButton
            onClick={paymentStage === 3 ? handleComplete : handleNextStep}
            disabled={!isSecondValid}
          >
            {paymentStage === 2 ? '다음' : '회원가입'}
          </NextButton>
        </>
      )}

      {showComplete && <SignupComplete />}
    </S.Wrapper>
  );
};

export default PaymentInfoForm;
