type Subtopic = {
  title: string;
  keyword: string;
};

export type AiResponse = {
  prompt: {
    inappropriate: string; // "false" as string, not boolean
    cause: string;
  };
  mainTopic: string;
  subtopics: Subtopic[];
};
