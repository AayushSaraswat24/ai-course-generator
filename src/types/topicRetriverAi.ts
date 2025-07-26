type Subtopic = {
  title: string;
  keyword: string;
};

export type AiResponse = {
  prompt: {
    inappropriate: string; // "false" as string, not boolean
    contain: string;
  };
  mainTopic: string;
  isVast: boolean;
  subtopics: Subtopic[];
};
