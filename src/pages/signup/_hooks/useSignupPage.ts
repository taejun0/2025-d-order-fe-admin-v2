import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import UserService from '@services/UserService';
import { ROUTE_PATHS } from '@constants/routeConstants';

export enum Step {
  USER = 1,
  PUB = 2,
  PAYMENT = 3,
  COMPLETE = 4,
}

export const useSignupPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(Step.USER);
  const [userStage, setUserStage] = useState(1);
  const [pubStage, setPubStage] = useState(1);
  const [paymentStage, setPaymentStage] = useState(1);

  const [formData, setFormData] = useState({
    userId: '',
    password: '',
    confirmPassword: '',
    pubName: '',
    tableCount: '',
    tableFee: '',
    tableFeePolicy: 'PP',
    maxTime: '',
    accountHolder: '',
    bank: '',
    accountNumber: '',
    confirmPaymentPassword: '',
    confirmPaymentPasswordCheck: '',
  });

  const handleChange = useCallback((key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSubmit = useCallback(async (): Promise<boolean> => {
    try {
      await UserService.postSignup({
        username: formData.userId,
        password: formData.password,
        booth_name: formData.pubName,
        table_num: Number(formData.tableCount),
        order_check_password: formData.confirmPaymentPassword,
        account: Number(formData.accountNumber),
        depositor: formData.accountHolder,
        bank: formData.bank,
        seat_type: formData.tableFeePolicy as 'PT' | 'PP' | 'NO',
        seat_tax_person:
          formData.tableFeePolicy === 'PP' ? Number(formData.tableFee) : 0,
        seat_tax_table:
          formData.tableFeePolicy === 'PT' ? Number(formData.tableFee) : 0,
        table_limit_hours: Number(formData.maxTime),
      });
      return true;
    } catch {
      return false;
    }
  }, [formData]);

  const goNext = useCallback(() => {
    setStep((prev) => (prev < Step.COMPLETE ? ((prev + 1) as Step) : prev));
  }, []);

  const goBack = useCallback(() => {
    if (step === Step.PAYMENT && paymentStage > 1) {
      if (paymentStage === 3) {
        setFormData((prev) => ({ ...prev, confirmPaymentPasswordCheck: '' }));
      }
      setPaymentStage((prev) => prev - 1);
    } else if (step === Step.PUB && pubStage > 1) {
      setPubStage((prev) => prev - 1);
    } else if (step === Step.USER && userStage > 1) {
      if (userStage === 3) {
        setFormData((prev) => ({ ...prev, confirmPassword: '' }));
      }
      setUserStage((prev) => prev - 1);
    } else if (step > Step.USER) {
      setStep((prev) => (prev - 1) as Step);
    } else {
      navigate(ROUTE_PATHS.INIT);
    }
  }, [step, userStage, pubStage, paymentStage, navigate]);

  const stepProps = useMemo(
    () => ({
      formData,
      onChange: handleChange,
      onNext: goNext,
      onSubmit: handleSubmit,
      pubStage,
      setPubStage,
      paymentStage,
      setPaymentStage,
      userStage,
      setUserStage,
    }),
    [
      formData,
      handleChange,
      goNext,
      handleSubmit,
      pubStage,
      setPubStage,
      paymentStage,
      setPaymentStage,
      userStage,
      setUserStage,
    ]
  );

  return {
    step,
    goBack,
    stepProps,
  };
};
