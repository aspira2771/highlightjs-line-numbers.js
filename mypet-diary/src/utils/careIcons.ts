import type { LucideIcon } from 'lucide-react';
import {
  Bath,
  Cookie,
  Cat,
  Dog,
  Droplets,
  FlaskConical,
  Footprints,
  Leaf,
  Lightbulb,
  PawPrint,
  Pill,
  Rabbit,
  Rat,
  Scissors,
  SprayCan,
  Stethoscope,
  Syringe,
  Thermometer,
  Turtle,
  UtensilsCrossed,
  Weight,
} from 'lucide-react';
import type { CareItemType, PetSpecies } from '@/types';

/** Context-appropriate line icon for each care type. */
export const CARE_ICON_COMPONENTS: Record<CareItemType, LucideIcon> = {
  meal: UtensilsCrossed,
  medication: Pill,
  supplement: FlaskConical,
  treat: Cookie,
  walk: Footprints,
  weight: Weight,
  vaccine: Syringe,
  hospital: Stethoscope,
  humidity: Droplets,
  temperature: Thermometer,
  shedding: Leaf,
  uvb_lamp: Lightbulb,
  cage_cleaning: SprayCan,
  bath: Bath,
  grooming: Scissors,
};

/** Line icon per species, used for the character avatar fallback. */
export const SPECIES_ICON_COMPONENTS: Record<PetSpecies, LucideIcon> = {
  dog: Dog,
  cat: Cat,
  reptile: Turtle,
  hamster: Rat,
  rabbit: Rabbit,
  other: PawPrint,
};
