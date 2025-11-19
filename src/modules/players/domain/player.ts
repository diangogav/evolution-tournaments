import type { Identified } from "../../shared/types";

export interface PlayerProps {
  id: string;
  displayName: string;
  nickname?: string | null;
  birthDate?: string | null;
  countryCode?: string | null;
  contactEmail?: string | null;
  preferredDisciplines: string[];
  isActive: boolean;
  metadata: unknown;
}
export class Player implements Identified {
  private constructor(private props: PlayerProps) {}

  static create(props: PlayerProps): Player {
    if (!props.displayName || props.displayName.trim().length === 0) {
      throw new Error("Player.displayName cannot be empty");
    }

    return new Player({
      ...props,
      preferredDisciplines: props.preferredDisciplines ?? [],
      metadata: props.metadata ?? {},
      isActive: props.isActive ?? true,
    });
  }

  get id() {
    return this.props.id;
  }

  get displayName() {
    return this.props.displayName;
  }

  get isActive() {
    return this.props.isActive;
  }

  deactivate() {
    this.props.isActive = false;
  }

  activate() {
    this.props.isActive = true;
  }

  updateMetadata(data: Record<string, unknown>) {
    this.props.metadata = {
      ...(this.props.metadata ?? {}),
      ...data,
    };
  }

  toPrimitives() {
    return {
      ...this.props,
      metadata: this.props.metadata,
    };
  }
}
