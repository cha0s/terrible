import {
  Form,
  json,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from '@remix-run/react';

import FluidText from '#fluid-text';
import {Game} from '#state/game';
import {juggleSession, loadSession} from '#state/session';

import PackChoice from './pack-choice';
import styles from './index.module.css';

import * as config from './config';

export const action = async ({request}) => {
  const {createGame} = await import('#state/game.server');
  const formData = await request.formData();
  const errors = Object.entries(config)
    .reduce((r, [k, v]) => ({
      ...r,
      ...!v.includes(formData.get(k)) && {[k]: `Invalid selection for ${k}`}
    }), Game.check(formData));
  if (Object.keys(errors).length > 0) {
    return json({errors});
  }
  const session = await loadSession(request);
  if (!session.id) {
    throw new Response('', {status: 400});
  }
  return redirect(`/play/${await createGame(session, formData)}`);
};

export const meta = () => {
  return [{title: 'Create | Do Terrible'}];
};

function isDefaultPack(name) {
  return [
    'cha0s from the sky',
    'CAH Base Set',
    'CAH: Main Deck',
    'CAH: Human Pack',
    'CAH: Blue Box Expansion',
    'CAH: Green Box Expansion',
    'CAH: Red Box Expansion',
    'CAH: Box Expansion',
    'CAH: 2000s Nostalgia Pack',
    'CAH: College Pack',
    'CAH: First Expansion',
    'CAH: Second Expansion',
    'CAH: Third Expansion',
    'CAH: Fourth Expansion',
    'CAH: Fifth Expansion',
    'CAH: Sixth Expansion',
  ].includes(name);
}

export async function loader({request}) {
  return json({
    packs: Game.packs.map(({name, id}) => ({default: isDefaultPack(name), label: name, id})),
    session: await juggleSession(request),
  });
}

export default function CreateSpace() {
  const actionData = useActionData();
  const {packs, session} = useLoaderData();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  const errors = Object.entries(actionData?.errors || {})
  const sortedPacks = packs.sort((l, r) => {
    if (l.default === r.default) {
      return l.label < r.label ? -1 : 1;
    }
    return l.default ? -1 : 1;
  });
  const renderedPackChoices = sortedPacks.map(
    (pack) => <PackChoice pack={pack} key={pack.id} />,
  );
  const isCreating = navigation.formAction === '/create';
  return (
    <div className={styles.createWrapper}>
      <div className={styles.create}>
        <Form method="post">
          <div className={styles.form}>
            <div>
              <button disabled={!session.id || isCreating} type="submit">
                <FluidText>
                  <div className={styles.text}>
                    {
                      session.id
                        ? (isCreating ? 'Starting the game...' : 'Start the game')
                        : 'Enable cookies'
                    }
                  </div>
                </FluidText>
              </button>
              {0 !== session.id && (
                <p>...or tweak some settings first</p>
              )}
              {(errors.length > 0 || searchParams.has('none')) && (
                <div className={styles.errors}>
                  {errors.map(([key, error]) => <div key={key}>{error}</div>)}
                  {searchParams.has('none') && (
                    <div key="none">No active games may be joined right now. Create one!</div>
                  )}
                </div>
              )}
            </div>
            {0 !== session.id && (
              <div className={styles.fieldsets}>
                <fieldset className={styles.limitsWrapper}>
                  <div className={styles.description}>Details</div>
                  <div className={styles.limits}>
                    <input name="maxPlayers" type="hidden" value="9" />
                    <label>
                      <span>score to win</span>
                      <select defaultValue={10} name="scoreToWin">
                        {config.scoreToWin.map((value) => (
                          <option key={value} value={value}>{value}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>seconds per round</span>
                      <select defaultValue={120} name="secondsPerRound">
                        {config.secondsPerRound.map((value) => (
                          <option key={value} value={value}>{value}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>bots</span>
                      <select defaultValue={0} name="bots">
                        {config.bots.map((value) => (
                          <option key={value} value={value}>{value}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                </fieldset>
                <fieldset className={styles.packsWrapper}>
                  <div className={styles.description}>Packs</div>
                  <div className={styles.packs}>{renderedPackChoices}</div>
                </fieldset>
              </div>
            )}
          </div>
        </Form>
      </div>
    </div>
  );
}
