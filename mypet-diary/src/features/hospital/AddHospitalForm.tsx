import { useState, type FormEvent } from 'react';
import { Button } from '@/components/common/Button';
import { Input, Textarea } from '@/components/common/Input';
import { useRecordsStore } from '@/stores/recordsStore';

interface Props {
  petId: string;
  onClose?: () => void;
}

export function AddHospitalForm({ petId, onClose }: Props) {
  const addHospital = useRecordsStore((s) => s.addHospital);
  const [visitDate, setVisitDate] = useState(
    () => new Date().toISOString().slice(0, 10),
  );
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalContact, setHospitalContact] = useState('');
  const [purpose, setPurpose] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [cost, setCost] = useState('');
  const [nextVisitDate, setNextVisitDate] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!hospitalName.trim() || !purpose.trim()) return;
    addHospital({
      petId,
      visitDate: new Date(`${visitDate}T10:00:00`).toISOString(),
      hospitalName: hospitalName.trim(),
      hospitalContact: hospitalContact.trim() || undefined,
      purpose: purpose.trim(),
      diagnosis: diagnosis.trim() || undefined,
      treatment: treatment.trim() || undefined,
      cost: cost ? Number(cost) : undefined,
      nextVisitDate: nextVisitDate
        ? new Date(`${nextVisitDate}T10:00:00`).toISOString()
        : undefined,
    });
    onClose?.();
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <Input
        label="방문일"
        name="visitDate"
        type="date"
        value={visitDate}
        onChange={(e) => setVisitDate(e.target.value)}
      />
      <Input
        label="병원명"
        name="hospitalName"
        value={hospitalName}
        onChange={(e) => setHospitalName(e.target.value)}
        placeholder="OO 동물병원"
      />
      <Input
        label="연락처 (선택)"
        name="hospitalContact"
        value={hospitalContact}
        onChange={(e) => setHospitalContact(e.target.value)}
      />
      <Input
        label="진료 목적"
        name="purpose"
        placeholder="정기검진, 예방접종 등"
        value={purpose}
        onChange={(e) => setPurpose(e.target.value)}
      />
      <Textarea
        label="진단 내용 (수의사 소견)"
        name="diagnosis"
        rows={2}
        value={diagnosis}
        onChange={(e) => setDiagnosis(e.target.value)}
      />
      <Textarea
        label="처치"
        name="treatment"
        rows={2}
        value={treatment}
        onChange={(e) => setTreatment(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="비용 (원)"
          name="cost"
          type="number"
          inputMode="numeric"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
        />
        <Input
          label="다음 방문"
          name="nextVisitDate"
          type="date"
          value={nextVisitDate}
          onChange={(e) => setNextVisitDate(e.target.value)}
        />
      </div>
      <Button type="submit" block>
        진료 저장
      </Button>
    </form>
  );
}
