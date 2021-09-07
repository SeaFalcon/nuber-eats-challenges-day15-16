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

function requestGraphql(app, query) {
  return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
    query,
  });
}

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
    let insertPodcastId;
    let insertEpisodeId;

    const getPodcastQuery = (id: number) => `
      {
        getPodcast(input: { id: ${id} }) {
          ok
          error
          podcast {
            id
            title
            category
            episodes {
              id
              title
              category
            }
          }
        }
      }
    `;

    const getEpisodesQuery = (id: number) => `
        {
          getEpisodes(input: { id: ${id} }) {
            ok
            error
            episodes {
              id
              title
              category
            }
          }
        }
      `;
    describe('createPodcast', () => {
      it('should create podcast', () => {
        const createPodcastQuery = `
          mutation {
            createPodcast(input: {
              title: "${testPodcast.title}"
              category: "${testPodcast.category}"
            }){
              ok
              error
              id
            }
          }
        `;

        return requestGraphql(app, createPodcastQuery)
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
            insertPodcastId = id;

            expect(ok).toBeTruthy();
            expect(error).toBeNull();
          });
      });

      it('should fail if podcast input value is wrong', () => {
        const createPodcastQuery = `
          mutation {
            createPodcast(input: {
              title: 1
              category: "${testPodcast.category}"
            }){
              ok
              error
              id
            }
          }
        `;

        return requestGraphql(app, createPodcastQuery)
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
      const getAllPodcastsQuery = `
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
        }
      `;

      it('should return all podcasts', () => {
        return requestGraphql(app, getAllPodcastsQuery)
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

    describe('getPodcast', () => {
      it('should return a podcast', () => {
        return requestGraphql(app, getPodcastQuery(insertPodcastId))
          .expect(200)
          .expect(req => {
            const {
              data: {
                getPodcast: { ok, error, podcast },
              },
            } = req.body;

            expect(ok).toBeTruthy();
            expect(error).toBeNull();
            expect(podcast).toMatchObject(testPodcast);
          });
      });

      it('should fail if podcast id is wrong', () => {
        const wrongId = 2;

        return requestGraphql(app, getPodcastQuery(wrongId))
          .expect(200)
          .expect(req => {
            const {
              data: {
                getPodcast: { ok, error },
              },
            } = req.body;

            expect(ok).toBeFalsy();
            expect(error).toBe(`Podcast with id ${wrongId} not found`);
          });
      });
    });

    describe('updatePodcast', () => {
      const newTitle = 'newPodcast';

      beforeAll(async () => {
        const [podcast] = await podcastsRepository.find();
        insertPodcastId = podcast.id;
      });

      it('should update podcast title', () => {
        const updatePodcastQuery = `
          mutation {
            updatePodcast(input: { id: 1, payload: { title: "${newTitle}" } }) {
              ok
              error
            }
          }        
        `;

        return requestGraphql(app, updatePodcastQuery)
          .expect(200)
          .expect(req => {
            const {
              data: {
                updatePodcast: { ok, error },
              },
            } = req.body;

            expect(ok).toBeTruthy();
            expect(error).toBeNull();
          });
      });

      it('should have a new podcast title', () => {
        return requestGraphql(app, getPodcastQuery(insertPodcastId))
          .expect(200)
          .expect(req => {
            const {
              data: {
                getPodcast: { podcast },
              },
            } = req.body;

            expect(podcast.id).toBe(insertPodcastId);
            expect(podcast.title).toBe(newTitle);
          });
      });
    });

    describe('createEpisode', () => {
      const createEpisodeQuery = (id: number) => `
        mutation {
          createEpisode(input: { title: "${testEpisode.title}", category: "${testEpisode.category}", podcastId: ${id} }) {
            id
            error
            ok
          }
        }
      `;

      it('should create episode in podcast', () => {
        return requestGraphql(app, createEpisodeQuery(insertPodcastId))
          .expect(200)
          .expect(res => {
            const {
              data: {
                createEpisode: { id, error, ok },
              },
            } = res.body;

            expect(id).toBe(1);
            insertEpisodeId = id;

            expect(ok).toBeTruthy();
            expect(error).toBeNull();
          });
      });

      it('should find new episode in podcast', () => {
        return requestGraphql(app, getPodcastQuery(insertPodcastId))
          .expect(200)
          .expect(res => {
            const {
              data: {
                getPodcast: {
                  podcast: { episodes },
                },
              },
            } = res.body;

            const [episode] = episodes;

            expect(episode.id).toBe(insertEpisodeId);
            expect(episode.title).toBe(testEpisode.title);
            expect(episode.category).toBe(testEpisode.category);
          });
      });
    });

    describe('getEpisodes', () => {
      it('should return episodes', () => {
        return requestGraphql(app, getEpisodesQuery(insertPodcastId))
          .expect(200)
          .expect(res => {
            const {
              data: {
                getEpisodes: { ok, error, episodes },
              },
            } = res.body;

            expect(ok).toBeTruthy();
            expect(error).toBeNull();
            expect(episodes).toHaveLength(1);
          });
      });

      it('should fail if podcast id is wrong', () => {
        const wrongId = 2;

        return requestGraphql(app, getEpisodesQuery(wrongId))
          .expect(200)
          .expect(res => {
            const {
              data: {
                getEpisodes: { ok, error },
              },
            } = res.body;

            expect(ok).toBeFalsy();
            expect(error).toBe(`Podcast with id ${wrongId} not found`);
          });
      });
    });

    describe('updateEpisode', () => {
      const updateEpisodeParams = {
        title: 'e2e-test',
        category: 'testing',
      };

      const updateEpisodeQuery = (
        podcastId: number,
        episodeId: number,
        { title, category },
      ) => `
        mutation {
          updateEpisode(
            input: { podcastId: ${podcastId}, episodeId: ${episodeId}, title: "${title}", category: "${category}" }
          ) {
            ok
            error
          }
        }
      `;

      it('should update episode', () => {
        return requestGraphql(
          app,
          updateEpisodeQuery(
            insertPodcastId,
            insertEpisodeId,
            updateEpisodeParams,
          ),
        )
          .expect(200)
          .expect(res => {
            const {
              data: {
                updateEpisode: { ok, error },
              },
            } = res.body;

            expect(ok).toBeTruthy();
            expect(error).toBeNull();
          });
      });

      it('should check updated episode', () => {
        return requestGraphql(app, getEpisodesQuery(insertPodcastId))
          .expect(200)
          .expect(res => {
            const {
              data: {
                getEpisodes: { episodes },
              },
            } = res.body;

            const [episode] = episodes;

            expect(episode.title).toBe(updateEpisodeParams.title);
            expect(episode.category).toBe(updateEpisodeParams.category);
          });
      });
    });

    describe('deleteEpisode', () => {
      const deleteEpisodeQuery = (podcastId, episodeId) => `
        mutation {
          deleteEpisode(input: { podcastId: ${podcastId}, episodeId: ${episodeId} }) {
            ok
            error
          }
        }
      `;

      it('should delete episode', () => {
        return requestGraphql(
          app,
          deleteEpisodeQuery(insertPodcastId, insertEpisodeId),
        )
          .expect(200)
          .expect(res => {
            const {
              data: {
                deleteEpisode: { ok, error },
              },
            } = res.body;

            expect(ok).toBeTruthy();
            expect(error).toBeNull();
          });
      });

      it('should check if episode is deleted', () => {
        return requestGraphql(app, getEpisodesQuery(insertPodcastId))
          .expect(200)
          .expect(res => {
            const {
              data: {
                getEpisodes: { episodes },
              },
            } = res.body;

            expect(episodes).toHaveLength(0);
          });
      });
    });

    describe('deletePodcast', () => {
      const deletePodcastQuery = (id: number) => `
        mutation {
          deletePodcast(input: { id: ${id} }) {
            ok
            error
          }
        }`;

      it('should delete podcast', () => {
        return requestGraphql(app, deletePodcastQuery(insertPodcastId))
          .expect(200)
          .expect(res => {
            const {
              data: {
                deletePodcast: { ok, error },
              },
            } = res.body;

            expect(ok).toBeTruthy();
            expect(error).toBeNull();
          });
      });

      it('should check if podcast is deleted', () => {
        return requestGraphql(app, getPodcastQuery(insertPodcastId))
          .expect(200)
          .expect(res => {
            const {
              data: {
                getPodcast: { ok, error, podcast },
              },
            } = res.body;

            expect(ok).toBeFalsy();
            expect(error).toBe(`Podcast with id ${insertPodcastId} not found`);
            expect(podcast).toBeNull();
          });
      });
    });
  });
  describe('Users Resolver', () => {
    describe('me', () => {});

    describe('seeProfile', () => {});

    describe('createAccount', () => {});

    describe('login', () => {});

    describe('editProfile', () => {});
  });
});
