import { CreateGroupUseCase } from "../../modules/groups/application/create-group.use-case";
import { GroupRepository } from "../../modules/groups/domain/group.repository";
import { CreateMatchUseCase } from "../../modules/matches/application/create-match.use-case";
import { ListMatchesByTournamentUseCase } from "../../modules/matches/application/list-matches-by-tournament.use-case";
import { RecordMatchResultUseCase } from "../../modules/matches/application/record-match-result.use-case";
import { MatchRepository } from "../../modules/matches/domain/match.repository";
import { CreateParticipantUseCase } from "../../modules/participants/application/create-participant.use-case";
import { ParticipantRepository } from "../../modules/participants/domain/participant.repository";
import { CreatePlayerUseCase } from "../../modules/players/application/create-player.use-case";
import { PlayerRepository } from "../../modules/players/domain/player.repository";
import { AddTeamMemberUseCase } from "../../modules/teams/application/add-team-member.use-case";
import { CreateTeamUseCase } from "../../modules/teams/application/create-team.use-case";
import { TeamMemberRepository } from "../../modules/teams/domain/team-member.repository";
import { TeamRepository } from "../../modules/teams/domain/team.repository";
import { CreateTournamentUseCase } from "../../modules/tournaments/application/create-tournament.use-case";
import { GenerateSingleEliminationBracketUseCase } from "../../modules/tournaments/application/generate-single-elimination-bracket.use-case";
import { RegisterTournamentEntryUseCase } from "../../modules/tournaments/application/register-tournament-entry.use-case";
import { TournamentEntryRepository } from "../../modules/tournaments/domain/tournament-entry.repository";
import { TournamentRepository } from "../../modules/tournaments/domain/tournament.repository";

export type HttpDependencies = {
    useCases: {
        createPlayer: CreatePlayerUseCase;
        createTeam: CreateTeamUseCase;
        addTeamMember: AddTeamMemberUseCase;
        createParticipant: CreateParticipantUseCase;
        createTournament: CreateTournamentUseCase;
        registerTournamentEntry: RegisterTournamentEntryUseCase;
        createGroup: CreateGroupUseCase;
        createMatch: CreateMatchUseCase;
        listMatchesByTournament: ListMatchesByTournamentUseCase;
        generateSingleEliminationBracket: GenerateSingleEliminationBracketUseCase;
        recordMatchResult: RecordMatchResultUseCase;
    };
    repositories: {
        players: PlayerRepository;
        teams: TeamRepository;
        teamMembers: TeamMemberRepository;
        participants: ParticipantRepository;
        tournaments: TournamentRepository;
        entries: TournamentEntryRepository;
        groups: GroupRepository;
        matches: MatchRepository;
    };
};
