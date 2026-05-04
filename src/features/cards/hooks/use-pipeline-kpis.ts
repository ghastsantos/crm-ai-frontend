import { useMemo } from 'react';
import type { Card } from '@/entities/card/types';
import type { PipelineColumn } from '@/entities/pipeline-column/types';

export type StageBreakdown = {
  columnId: string;
  title: string;
  count: number;
  value: number;
};

export type PipelineKPIs = {
  totalCards: number;
  totalValue: number;
  averageTicket: number | null;
  cardsWithValue: number;
  cardsWithoutValue: number;
  perStage: StageBreakdown[];
  topStages: StageBreakdown[];
};

export function usePipelineKPIs(cards: Card[], columns: PipelineColumn[]): PipelineKPIs {
  return useMemo(() => {
    const sortedColumns = [...columns].sort((a, b) => a.position - b.position);
    const perStage: StageBreakdown[] = sortedColumns.map((col) => ({
      columnId: col.id,
      title: col.title,
      count: 0,
      value: 0,
    }));
    const stageIndex = new Map<string, StageBreakdown>();
    perStage.forEach((s) => stageIndex.set(s.columnId, s));

    let totalValue = 0;
    let cardsWithValue = 0;
    let cardsWithoutValue = 0;

    for (const card of cards) {
      const stage = stageIndex.get(card.pipelineColumnId);
      if (stage) stage.count += 1;
      if (card.value != null) {
        cardsWithValue += 1;
        totalValue += card.value;
        if (stage) stage.value += card.value;
      } else {
        cardsWithoutValue += 1;
      }
    }

    const totalCards = cards.length;
    const averageTicket = cardsWithValue > 0 ? totalValue / cardsWithValue : null;
    const topStages = [...perStage]
      .filter((s) => s.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    return {
      totalCards,
      totalValue,
      averageTicket,
      cardsWithValue,
      cardsWithoutValue,
      perStage,
      topStages,
    };
  }, [cards, columns]);
}
