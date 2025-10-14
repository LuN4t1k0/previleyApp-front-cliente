import {
  DateRangePicker,
  DateRangePickerItem,
  DateRangePickerValue,
} from '@tremor/react';
import { es } from 'date-fns/locale';
import { useState } from 'react';

const getCurrentMonthRange = () => {
  const start = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const end = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
  return { from: start, to: end };
};

const getCurrentYearRange = () => {
  const start = new Date(new Date().getFullYear(), 0, 1);
  const end = new Date(new Date().getFullYear(), 11, 31);
  return { from: start, to: end };
};

const getCurrentFirstHalfYearRange = () => {
  const start = new Date(new Date().getFullYear(), 0, 1);
  const end = new Date(new Date().getFullYear(), 5, 30);
  return { from: start, to: end };
};

const getCurrentSecondHalfYearRange = () => {
  const start = new Date(new Date().getFullYear(), 6, 1);
  const end = new Date(new Date().getFullYear(), 11, 31);
  return { from: start, to: end };
};

const DateRangeFilter = ({ value, onChange }) => {
  const [selectedValue, setSelectedValue] = useState(value || getCurrentMonthRange());

  const handleChange = (newValue) => {
    setSelectedValue(newValue);
    onChange(newValue);
  };

  return (
    <DateRangePicker
      className="mx-auto max-w-md"
      value={selectedValue}
      onValueChange={handleChange}
      locale={es}
      selectPlaceholder="Seleccionar"
      color="rose"
    >
      <DateRangePickerItem key="current_month" value="current_month" from={getCurrentMonthRange().from} to={getCurrentMonthRange().to}>
        Mes en curso
      </DateRangePickerItem>
      <DateRangePickerItem key="current_year" value="current_year" from={getCurrentYearRange().from} to={getCurrentYearRange().to}>
        Año en curso
      </DateRangePickerItem>
      <DateRangePickerItem key="first_half" value="first_half" from={getCurrentFirstHalfYearRange().from} to={getCurrentFirstHalfYearRange().to}>
        Primer semestre
      </DateRangePickerItem>
      <DateRangePickerItem key="second_half" value="second_half" from={getCurrentSecondHalfYearRange().from} to={getCurrentSecondHalfYearRange().to}>
        Segundo semestre
      </DateRangePickerItem>
      <DateRangePickerItem key="last_30_days" value="last_30_days" from={new Date(new Date().setDate(new Date().getDate() - 30))} to={new Date()}>
        Últimos 30 días
      </DateRangePickerItem>
    </DateRangePicker>
  );
};

export default DateRangeFilter;

