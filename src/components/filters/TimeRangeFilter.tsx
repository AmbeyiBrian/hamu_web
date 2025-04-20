import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import { useFilters, TimeRangeType } from '../../context/FilterContext';

const TimeRangeFilter: React.FC = () => {
  const { timeRange, setTimeRange } = useFilters();

  const handleTimeRangeChange = (event: SelectChangeEvent) => {
    setTimeRange(event.target.value as TimeRangeType);
  };

  return (
    <FormControl sx={{ minWidth: 200 }}>
      <InputLabel id="time-range-label">Time Range</InputLabel>
      <Select
        labelId="time-range-label"
        id="time-range-select"
        value={timeRange}
        label="Time Range"
        onChange={handleTimeRangeChange}
        size="small"
      >
        <MenuItem value="day">Today</MenuItem>
        <MenuItem value="week">This Week</MenuItem>
        <MenuItem value="month">This Month</MenuItem>
        <MenuItem value="quarter">This Quarter</MenuItem>
        <MenuItem value="year">This Year</MenuItem>
      </Select>
    </FormControl>
  );
};

export default TimeRangeFilter;