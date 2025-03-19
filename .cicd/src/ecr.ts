import { ecr } from '@pulumi/awsx';

export const ecrRepository = new ecr.Repository('sai-ecr', {
  name: 'sai-ecr',
  lifecyclePolicy: {
    rules: [
      {
        tagStatus: 'untagged',
        maximumNumberOfImages: 3,
      },
    ],
  },
});
