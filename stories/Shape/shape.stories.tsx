// import { Button } from '@storybook/react/demo';
import { storiesOf } from '@storybook/react';
import React from 'react';
import DefaultShape from './component/default-shape';
import CustomNode from './component/custom-node';

export default { title: 'Shape' };

storiesOf('Shape', module)
  .add('default node', () => (
    <DefaultShape />
  ))
  .add('custom node', () => (
    <CustomNode />
  ))
