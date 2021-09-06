import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import { INestApplication } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Podcast } from 'src/podcast/entities/podcast.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

const GRAPHQL_ENDPOINT = '/graphql';
describe('App (e2e)', () => {
  let app: INestApplication;
  let podcastsRepository: Repository<Podcast>;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    podcastsRepository = moduleFixture.get<Repository<Podcast>>(
      getRepositoryToken(Podcast),
    );
    await app.init();
  });

  describe('Podcasts Resolver', () => {
    describe('getAllPodcasts', () => {
      it('should return all podcasts', () => {
        return request(app.getHttpServer())
          .post(GRAPHQL_ENDPOINT)
          .send({
            query: `
            {
              getAllPodcasts {
                ok
                error
                podcasts {
                  title
                }
              }
            }`,
          })
          .expect(200);
      });
    });

    it.todo('getPodcast');
    it.todo('getEpisodes');
    it.todo('createPodcast');
    it.todo('deletePodcast');
    it.todo('updatePodcast');
    it.todo('createEpisode');
    it.todo('updateEpisode');
    it.todo('deleteEpisode');
  });
  describe('Users Resolver', () => {
    it.todo('me');
    it.todo('seeProfile');
    it.todo('createAccount');
    it.todo('login');
    it.todo('editProfile');
  });
});
