import DatePicker from "react-date-picker"
import { ContainerDatePicker, ContainerDatePickerIcon } from "./styles"

export function SelectDatePickerIcon({onChange, value, minDate, maxDate}){
  return(
    <ContainerDatePickerIcon>
      <DatePicker
        calendarClassName='calendar-view'
        className='calendar'
        selectRange={true}
        format='dd/MM/yyyy'
        onChange={onChange}
        value={value}
        clearIcon={null}
        minDate={minDate}
        maxDate={maxDate}
      />
    </ContainerDatePickerIcon>
  )
}
export function SelectDatePicker({onChange, value, minDate, maxDate}){
  return(
    <ContainerDatePicker>
      <DatePicker
        calendarClassName='calendar-view'
        className='calendar'
        selectRange={true}
        format='dd/MM/yyyy'
        onChange={onChange}
        value={value}
        clearIcon={null}
        minDate={minDate}
        maxDate={maxDate}
      />
    </ContainerDatePicker>
  )
}