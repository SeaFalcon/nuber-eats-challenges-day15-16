# nuber-eats-challenges-day15-16

<details>
  <summary>
  Day 11-12 정답해설
  </summary>

1. jwt.service.spec.ts

![](https://i.ibb.co/rv2KVw7/jwttest.png)
- 셋 중 제일 간단한 jwt.service 테스트 파일을 보겠습니다. jwt, users.service, podcast.service 모든 파트들이 마찬가지이지만 먼저 유닛 테스트 할 대상과 흉내내기할 대상을 고려해야 합니다. jwt service같은 경우에는 jsonwebtoken 패키지 이외에는 달리 mocking 할 것이 없습니다. 그래서 위와 같이 설정을 해주시면 테스트 준비가 끝입니다. jwt service가 제대로 준비 되었는지 확인하시려면 it('should be defined',()=>{ expect(service).toBeDefined();}); 이 코드를 이용하시면 되겠습니다.
- 사실 jwt.service는 테스트 할 것이 별로 없습니다. jwt.service의 메소드도 sign, verify 밖에 없고 심지어 로직도 그냥 jsonwebtoken 패키지 wrapper 수준으로 그냥 리턴 값만 가지고 있어 별 로직이 없습니다. 그래서 테스트도 단순합니다.

![](https://i.ibb.co/s6grdRD/jwtsign.png)
- 위 코드를 보면 jest.mock('jsonwebtoken', () => ...) 이 블럭은 jsonwebtoken 패키지를 mocking하는 것입니다. 유닛테스트이기 때문에 jwt service 자체에만 집중해야 하기 때문에 이러한 영향을 줄 수 있는 패키지나 함수, 클래스들은 mocking하여 테스트의 도구로 이용합니다.
- 밑에 expect(jwt.sign).toHaveBeenCalledTimes(1);은 jwt.sign이 단 한 번 호출 되는지 테스트로 확인하는 것입니다. expect와 실제와 다르면 테스트는 실패하고, 코드 또는 로직에 문제가 있다. 그렇게 판단할 수 있습니다. 이러한 패턴으로 계속 나오니, 아 이렇게 테스트하는구나 정도로 이해하고 넘어가시면 되겠습니다.
- describe, it를 적절히 잘 사용하면 테스트 코드 가독성이 높아집니다. describe은 테스트할 대상에 대해 설명을 해놓는 것이라 생각하시면 될 듯하구, it(individual test), 그 대상을 개별적으로 테스트 하는 것을 의미합니다. describe에서 jwt sign method에 대해서 테스트 합니다. 라고 누구나 쉽게 이해할 수 있고, it에서 이 테스트에서는 MOCKED_TOKEN을 꼭 리턴해줘 합니다.. 라는 테스트 목적을 쉽게 알 수 있습니다.
2. users.service.spec.ts

![](https://i.ibb.co/J5690JQ/user-service.png)
- jwt.service 테스트 파일에 비하여 설정이 복잡합니다. 먼저 user service만 테스트해야 하는데, repository도 연결되어 있고, user 로그인 처리할 때 사용하는 jwt service도 연결되어 있습니다. user service에 집중해야 하는 단위 테스트이므로, 이것들은 mocking을 해야 합니다. jwtService는 jwt.service와 마찬가지로 여기서도 다시 mocking을 해주고, repository는 약간 생소하지만 위의 코드와 같이 설정을 해줍니다.
- beforeAll? beforeEach?
- 코드를 보시면 jwt.service.spec.ts와는 달리 users.service.spec.ts에서는 beforeAll이 아니라 beforeEach로 모듈을 초기화했습니다. 이 둘의 차이는 뭘까요?
- 테스트를 진행하기 전에 앞의 jwt 테스트에서 한 것처럼 세팅이 필요합니다. 세팅을 매 테스트마다 할 것인지 또는 전체 테스트에서 한 번만해도 되는지의 차이입니다.
- 예를들어, mocking한 respository 같은 경우에는 createAccount 테스트에도 사용할 수가 있고, seeProfile, editProfile 테스트하는 경우에도 모두 사용가능한데, 매번 사용횟수나 들어 간 변수들을 초기화하지 않으면 테스트가 꼬일 수 밖에 없습니다. 그래서 user.service를 테스트할 때에는 beforeAll이 아니라 beforeEach가 되는 것입니다. jest의 테스트 설정과 관련된 문서를 참고하시면 도움 될 것 같습니다.
- test
- user나 podcast의 테스트는 jwt와는 비교도 안되게 양이 많습니다. 먼저 users.service의 createAccount를 살펴 보겠습니다.
- createAccount의 모든 부분에 대해서 테스트를 하려면, 아래 그림처럼 고려를 해야 할 것입니다.

![](https://i.ibb.co/dffkTBr/create-account.png)
- 1의 경우 - 이미 존재하는 이메일이 있을 경우에는 creatAccount가 실패해야 합니다.
- 2의 경우 - 정상적으로 계정이 만들어져야 하는 경우입니다.
- 3의 경우 - findOne이나 save 메소드에서 에러가 발생하여 catch로 넘어가는 경우입니다.
- 위의 createAccount에서는 위의 logic들을 판단해야만 코드 모든 부분들을 테스트 하는 것으로 볼 수 있습니다. 그래서 테스트는
- it('should success to create User', async () => { ...
- it('should fail because of user existing', async () => { ...
- it('should fail because of saving failed', async () => { ...
- 이렇게 세 가지 로직으로 테스트를 할 수 있습니다. 그러면 createAccount에 대한 test coverage가 전부 채워집니다.
- 위의 it(individual test) 코드를 조금더 살펴 보면 테스트가 어떤 식으로 진행이 되어야 하는지 감을 잡을 수 있습니다.
- it('should success to create user', ...: createAccount를 호출해서 성공적으로 계정 만드는 것을 테스트 하는 것입니다. service의 로직만 테스트하는 것이므로 respository는 흉내내기를 해야 합니다. users.service.spec.ts 상단 코드에 보면 이미 userRepository를 흉내내고 설정을 해놨습니다. beforeEach를 통해서 매 테스트마다 초기화가 되기 때문에 걱정하지 않고 테스트 안에서 리턴 값을 흉내낼 수 있습니다.
- userRepository.findOne.mockResolvedValueOnce(null); : user repository의 findOne값을 흉내낸 것입니다. mockResolvedValue는 Promise를 리턴합니다. Promise의 resolve값이 null이라는 뜻이 되겠습니다. 실제 db라면 db 연결이나 상태에 따라 값을 리턴 못할 수도 있고 연결이 안될 수도 있기 때문에 유닛 테스트라는 의미가 살지 않기 때문에 어떤 경우라도 db와는 관계 없이 null 값을 resolve로 넘겨준다는 뜻이 됩니다.
- userRepository.create.mockReturnValueOnce(hostArgs);: create는 typeorm repository에서 Promise로 리턴을 하는 것이 아니라, 엔티티 객체를 리턴해줍니다. 세이브 되기 이전 값입니다. 그래서 create는 resolve 값을 리턴하는 것이 아닙니다. 그냥 객체를 리턴해주기 때문에 위와 같이 설정을 해주면 되겠습니다.
- userRepository.save.mockResolvedValue(TEST_HOST);: findOne과 마찬가지로 resolve 값을 리턴해줍니다. 성공적으로 만들어진 경우이므로 db에 성공적으로 저장된 값을 리턴하는 repository의 save 메소드를 흉내낸 것입니다. 여기까지가 createAccount를 테스트하기 위한 준비 과정이기 때문에, 이번에는 실제로 createAccount를 호출하도록 합니다.
3. const result = await service.createAccount(hostArgs);
- createAccount가 호출되었습니다. 우리가 설정해 놓은 값에 의하면 위 코드는 findOne을 호출해서 이미 존재하는 이메일 계정이 없음을 확인하고 create 메소드를 호출해서 entity를 만들고, save 메소드를 호출해서 db에 엔티티를 저장하는 로직으로 흘러 갈 것입니다.
- 우리가 만든 createAccount가 위의 로직대로 흘러간다고 기대하였으므로, 실제로 그렇게 호출이 되었나 확인만 해주면 테스트를 성공적으로 한 것입니다.

- ![](https://i.ibb.co/6RSRGpy/success-test.png)
- 위의 로직대로 findOne이 호출되었는가(toHaveBeenCalledTimes), 파라미터는 제대로 입력 되었는가(toHaveBeenCalledWith), create는 제대로 호출되었는가, save는 제대로 호출되었고, 결과가 우리가 원하는 값(toMatchObject)이 나오는가?를 jest에서 판단을 해주기 때문에 createAccount가 정상적으로 작동하는 경우 테스트가 끝난 것입니다.
- createAccount를 모두 테스트하려면, 앞에서 언급드린 대로, 이미 이메일 계정이 이미 있는 경우와, save 메소드가 실패할 경우를 모두 테스트해야 full coverage를 완성할 수 있습니다.
- 이제 나머지는 노가다입니다. 테스트할 메소드들의 로직들을 살펴 보시면서 어떻게 테스트해야 모든 경우를 다 테스트 할 수 있을까 고려하시고, createAccount처럼 모두 테스트하면 됩니다. 상당히 양이 많은 편입니다.
### 결론
테스트에 앞서 유닛테스트가 어떤 개념인지 잘 이해하시고, 설정, 사용방법만 익혀두신다면 jest 패키지를 이용해서 빠르고 간단하면서 가독성 좋게 테스트를 실행할 수 있습니다. 테스트를 적절하게 잘 이해할 수 있게 해주고 여러 테스트를 연습해 볼 수 있도록 해주는 유익한 챌린지 과제였습니다.
</details>

### Unit Testing!

- 오늘의 강의: 우버 이츠 클론코딩 강의 #9.0
- 오늘의 과제: 위의 강의를 시청하신 후, 아래 코드 챌린지를 제출하세요.
- 제출기간: 2 Day Challenge (2021-09-06 ~ 2021-09-07)

### Code Challenge

- 이번 과제는 users.resolver.ts와 podcasts.resolver.ts 에 대해 E2E 테스트를 작성하는 것입니다. 아래 그림처럼 app.e2e-spec.ts의 it.todo()에 모든 resolver 테스트를 완성하세요.

![](https://i.imgur.com/lg1jTwv.png)


<details>
  <summary>
  Hint
  </summary>

- e2e테스트 확인은 npm run test:e2e입니다.
- e2e테스트 어떤 개념, 의미인지 확인하시고 챌린지 시작하시길 바랍니다.(참고 링크: [e2e test](https://docs.nestjs.kr/fundamentals/testing#end-to-end-testing])
- it.todo를 describe으로 바꾸고 테스트 작성하시면 됩니다.
- repository는 podcastRepository = module.get<Repository<Podcast>>(getRepositoryToken(Podcast)); 이런식으로 초기화 시켜주시면 됩니다.
- string을 쿼리문에 넣으실 때 "" 큰 따옴표 넣는 것을 까먹으시면 안됩니다.
</details>