// import { Button } from '@storybook/react/demo';
import { storiesOf } from '@storybook/react';
import React from 'react';
import RegisterLayout from './component/register-layout';
import DagreLayout from './component/dagre-layout';
import FruchtermanWorker from './component/fruchterman-worker-layout';
import SankeyLayout from './component/sankey-layout';

export default { title: 'Layout' };

storiesOf('Layout', module)
  .add('Register layout', () => <RegisterLayout />)
  .add('Dagre layout', () => <DagreLayout />)
  .add('Fruchterman worker layout', () => <FruchtermanWorker />)
  .add('Sankey layout', () => <SankeyLayout />);
