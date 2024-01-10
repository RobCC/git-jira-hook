import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv))
  .options({
    config: { type: 'string', default: '' },
    debug: { type: 'boolean', default: false },
    projectId: { type: 'string' },
  })
  .parseSync();

export const COMMIT_MSG_FILE = argv._[0] as string;

export default argv;
