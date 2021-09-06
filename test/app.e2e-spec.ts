import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import { INestApplication } from '@nestjs/common';
import { getConnection, Repository } from 'typeorm';
import { Podcast } from 'src/podcast/entities/podcast.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

const GRAPHQL_ENDPOINT = '/graphql';

const testPodcast = {
  title: 'how to build nest.js backend',
  category: 'programming',
};

const testEpisode = {
  title: 'app.module',
  category: 'initialize',
};
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

  afterAll(() => {
    getConnection().dropDatabase();
  });

  describe('Podcasts Resolver', () => {
    describe('createPodcast', () => {
      it('should create podcast', () => {
        return request(app.getHttpServer())
          .post(GRAPHQL_ENDPOINT)
          .send({
            query: `
            mutation {
              createPodcast(input: {
                title: "${testPodcast.title}"
                category: "${testPodcast.category}"
              }){
                ok
                error
                id
              }
            }`,
          })
          .expect(200)
          .expect(res => {
            const {
              body: {
                data: {
                  createPodcast: { id, ok, error },
                },
              },
            } = res;

            expect(id).toBe(1);
            expect(ok).toBeTruthy();
            expect(error).toBeNull();
          });
      });

      it('should fail if podcast input value is wrong', () => {
        return request(app.getHttpServer())
          .post(GRAPHQL_ENDPOINT)
          .send({
            query: `
            mutation {
              createPodcast(input: {
                title: 1
                category: "${testPodcast.category}"
              }){
                ok
                error
                id
              }
            }`,
          })
          .expect(400)
          .expect(res => {
            const {
              body: { errors },
            } = res;

            const [error] = errors;

            expect(error.message).toBe(
              'String cannot represent a non string value: 1',
            );
          });
      });
    });

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
                  id
                  title
                  category
                }
              }
            }`,
          })
          .expect(200)
          .expect(res => {
            const {
              body: {
                data: {
                  getAllPodcasts: { ok, error, podcasts },
                },
              },
            } = res;

            expect(podcasts).toHaveLength(1);
            expect(ok).toBeTruthy();
            expect(error).toBeNull();
          });
      });
    });

    it.todo('getPodcast');
    it.todo('updatePodcast');
    it.todo('deletePodcast');

    it.todo('createEpisode');
    it.todo('getEpisodes');
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
