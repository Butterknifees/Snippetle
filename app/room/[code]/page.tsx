import { RoomClient } from '../../../components/game/RoomClient';

export async function generateStaticParams() {
  return [
    { code: 'DEMO' },
    { code: 'PARTY' },
    { code: 'LOBBY' },
    { code: 'ROOM' }
  ];
}

export default async function RoomPage(props: {
  params: Promise<{ code: string }>;
}) {
  const params = await props.params;
  return <RoomClient roomCode={params.code} />;
}
