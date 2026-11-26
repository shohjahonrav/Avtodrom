import { notFound } from 'next/navigation';
import { ExerciseDetailClient } from '@/features/exercises/components/ExerciseDetailClient';
import { EXERCISES_B, getExerciseBySlug } from '@/features/exercises/data/exercisesB';

export function generateStaticParams() {
  return EXERCISES_B.map((ex) => ({ slug: ex.slug }));
}

export default async function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const exercise = getExerciseBySlug(slug);
  if (!exercise) {
    notFound();
  }
  return <ExerciseDetailClient exercise={exercise} />;
}
