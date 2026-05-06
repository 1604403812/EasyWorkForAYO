import { TodoItem } from '@/types';

export const getWeekNumber = (date: Date): number => {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + startOfYear.getDay() + 1) / 7);
};

export const isEvenWeek = (date: Date): boolean => {
  return getWeekNumber(date) % 2 === 0;
};

export const getTodoList = (): TodoItem[] => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const date = today.getDate();
  const todos: TodoItem[] = [];

  if (dayOfWeek === 3) {
    todos.push({
      task: '本周末活动预告报送',
      deadline: '今日',
      type: 'warning',
    });
  }

  if (dayOfWeek === 4 && isEvenWeek(today)) {
    todos.push({
      task: '下两周活动预告报送',
      deadline: '今日',
      type: 'warning',
    });
  }

  if (dayOfWeek === 2 && isEvenWeek(today)) {
    todos.push({
      task: '周末活动回顾报送',
      deadline: '今日',
      type: 'info',
    });
  }

  if (dayOfWeek === 5 && isEvenWeek(today)) {
    todos.push({
      task: '上两周活动回顾报送',
      deadline: '今日',
      type: 'info',
    });
  }

  if (date === 20) {
    todos.push({
      task: '生成上月活动台账',
      deadline: '今日',
      type: 'success',
    });
  }

  if (date === 25) {
    todos.push({
      task: '生成本月回顾资料合集',
      deadline: '今日',
      type: 'success',
    });
  }

  if (date === 1) {
    todos.push({
      task: '上月活动统计分析',
      deadline: '今日',
      type: 'success',
    });
  }

  return todos;
};

export const getDateRange = (type: 'month' | 'lastMonth' | 'custom', startDate?: Date, endDate?: Date): { start: Date; end: Date } => {
  const today = new Date();
  
  switch (type) {
    case 'month': {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return { start, end };
    }
    case 'lastMonth': {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      return { start, end };
    }
    case 'custom': {
      return { start: startDate || today, end: endDate || today };
    }
  }
};

export const getMonthDateRange = (year: number, month: number): { start: Date; end: Date } => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);
  return { start, end };
};

export const getLastMonthRange = (): { start: Date; end: Date } => {
  const today = new Date();
  const lastMonth20 = new Date(today.getFullYear(), today.getMonth() - 1, 20);
  const thisMonth20 = new Date(today.getFullYear(), today.getMonth(), 20);
  return { start: lastMonth20, end: thisMonth20 };
};
