interface WeekDayHeaderProps {
    date: Date;
    index: number;
  }
  
  export const WeekDayHeader = ({ date, index }: WeekDayHeaderProps) => {
    const isToday = new Date().toDateString() === date.toDateString();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <div 
        className={`p-2 border-t border-l font-medium text-center ${
          isToday ? 'bg-primary/10' : ''
        }`}
      >
        <div>{days[index]}</div>
        <div className={`text-sm mt-1 ${isToday ? 'font-bold' : 'text-muted-foreground'}`}>
          {date.getDate()}
        </div>
      </div>
    );
  };